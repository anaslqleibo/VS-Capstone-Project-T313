import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const locations = await executeQuery(
            `SELECT id, name, address, notes FROM locations ORDER BY name` 
        );

        const locationsArray = Array.isArray(locations) ? locations : [];
        return NextResponse.json(locationsArray);
    }
    catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
    }
};

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Location id is required" }, { status: 400 });
    }
    await executeQuery("DELETE FROM locations WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 });
  }
}


export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { id, name, address, notes } = body;

    const updates = [];
    const vals = [];

    if (!name && !address && !notes){
      return NextResponse.json(
      { error: "Please provide atleast one field to update!" },
      { status: 401 }
      );
    }

    if (name) {
      updates.push('name = ?');
      vals.push(name);
    }
    if (address) {
      updates.push('address = ?');
      vals.push(address);
    }
    if (notes) {
      updates.push('notes = ?');
      vals.push(notes);
    }
    vals.push(id);

    const result = await executeQuery(`UPDATE locations SET ${updates.join(', ')} WHERE id = ?`, vals) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating location details:", error);
    return NextResponse.json(
      { error: "Failed to update location details" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const { name, address, notes } = await req.json();

    if (!name) {
      return new Response("Missing required field name", { status: 400 });
    }

    const res = await executeQuery(`INSERT INTO locations (name, address, notes) VALUES (?, ?, ?)`, 
      [name, address??'', notes??'']
    ) as any;

    if (res.affectedRows === 0) {
      return NextResponse.json(
        { error: "Failed to create location" },
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ message: "Location created successfully", id: res.insertId }), {status: 200,});

  } catch (err) {
    console.error("Location creation DB error:", err);
    return new Response("Failed to create location", { status: 500 });
  }
}
