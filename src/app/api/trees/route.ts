import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SAMPLE_TREES } from '../../../data/sampleTrees';
import { TreeData } from '../../../types';

const dataFilePath = path.join(process.cwd(), 'src/data/trees.json');

// --- Helper Functions for Local Storage Fallback ---
function readLocalTrees(): TreeData[] {
  try {
    if (!fs.existsSync(dataFilePath)) {
      const dir = path.dirname(dataFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dataFilePath, JSON.stringify(SAMPLE_TREES, null, 2), 'utf-8');
      return SAMPLE_TREES;
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to read local trees:', error);
    return SAMPLE_TREES;
  }
}

function writeLocalTrees(trees: TreeData[]): boolean {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(trees, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to write local trees (might be a read-only filesystem in production):', error);
    return false;
  }
}

// --- Helper Functions for Vercel KV ---
const isVercelKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

async function getVercelKVTrees(): Promise<TreeData[]> {
  const url = `${process.env.KV_REST_API_URL}/get/trees`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Vercel KV GET failed: ${res.statusText}`);
  const data = await res.json();
  if (data.result) {
    return JSON.parse(data.result);
  }
  // If KV is empty, initialize it with sample trees
  await setVercelKVTrees(SAMPLE_TREES);
  return SAMPLE_TREES;
}

async function setVercelKVTrees(trees: TreeData[]): Promise<void> {
  const url = `${process.env.KV_REST_API_URL}/set/trees`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
    },
    body: JSON.stringify(trees),
  });
  if (!res.ok) throw new Error(`Vercel KV SET failed: ${res.statusText}`);
}

// --- Helper Functions for Supabase ---
const isSupabase = !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

async function getSupabaseTrees(): Promise<TreeData[]> {
  const url = `${process.env.SUPABASE_URL}/rest/v1/trees?select=*`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase GET failed (${res.status}): ${errText}`);
  }
  const data = await res.json();
  
  // Format relational or flat structure if needed. 
  // Leaflet location needs to be {x, y} which is stored as JSON in Supabase.
  return data as TreeData[];
}

async function upsertSupabaseTree(tree: TreeData): Promise<void> {
  const url = `${process.env.SUPABASE_URL}/rest/v1/trees`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates', // Upsert based on primary key (id)
    },
    body: JSON.stringify(tree),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase UPSERT failed (${res.status}): ${errText}`);
  }
}

async function deleteSupabaseTree(id: string): Promise<void> {
  const url = `${process.env.SUPABASE_URL}/rest/v1/trees?id=eq.${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase DELETE failed (${res.status}): ${errText}`);
  }
}

// --- API Route Handlers ---

export async function GET() {
  try {
    let trees: TreeData[] = [];
    let provider = 'local-file';

    if (isVercelKV) {
      trees = await getVercelKVTrees();
      provider = 'vercel-kv';
    } else if (isSupabase) {
      trees = await getSupabaseTrees();
      provider = 'supabase';
    } else {
      trees = readLocalTrees();
    }

    return NextResponse.json({ success: true, provider, trees });
  } catch (error: any) {
    console.error('API GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch trees' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const treeData: TreeData = await request.json();
    if (!treeData.id) {
      return NextResponse.json({ success: false, error: 'Tree ID is required' }, { status: 400 });
    }

    let provider = 'local-file';

    if (isVercelKV) {
      provider = 'vercel-kv';
      const trees = await getVercelKVTrees();
      const index = trees.findIndex(t => t.id === treeData.id);
      if (index >= 0) {
        trees[index] = treeData;
      } else {
        trees.push(treeData);
      }
      await setVercelKVTrees(trees);
    } else if (isSupabase) {
      provider = 'supabase';
      await upsertSupabaseTree(treeData);
    } else {
      const trees = readLocalTrees();
      const index = trees.findIndex(t => t.id === treeData.id);
      if (index >= 0) {
        trees[index] = treeData;
      } else {
        trees.push(treeData);
      }
      const success = writeLocalTrees(trees);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Read-only filesystem. Please configure environment variables for cloud database.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, provider, tree: treeData });
  } catch (error: any) {
    console.error('API POST Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save tree' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Tree ID is required' }, { status: 400 });
    }

    let provider = 'local-file';

    if (isVercelKV) {
      provider = 'vercel-kv';
      const trees = await getVercelKVTrees();
      const updatedTrees = trees.filter(t => t.id !== id);
      await setVercelKVTrees(updatedTrees);
    } else if (isSupabase) {
      provider = 'supabase';
      await deleteSupabaseTree(id);
    } else {
      const trees = readLocalTrees();
      const updatedTrees = trees.filter(t => t.id !== id);
      const success = writeLocalTrees(updatedTrees);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Read-only filesystem. Please configure environment variables for cloud database.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, provider, deletedId: id });
  } catch (error: any) {
    console.error('API DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete tree' },
      { status: 500 }
    );
  }
}
