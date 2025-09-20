import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeTransaction } from "@/app/lib/db";

export async function GET(request: NextRequest, context: RouteContext<'/api/users/[id]'>) {
  try {

    const { id } = await context.params;

    const user = await executeQuery(`SELECT u.id as id, u.first_name as first_name, u.last_name as last_name, u.email as email, u.phone as phone, u.role as role, e.preferred_name as preferred_name, e.gender as gender, DATE_FORMAT(e.date_of_birth, '%d/%m/%Y') as date_of_birth, e.address as address, e.emergency_person as emergency_person, e.emergency_contact as emergency_contact, p.id as pay_rate_id FROM users u LEFT JOIN employee_details e ON e.user_id=u.id LEFT JOIN pay_rates p ON e.pay_rate_id = p.id WHERE u.id = ?`, [id]);

    if (!user || (Array.isArray(user) && user.length === 0)) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = user;
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext<'/api/users/[id]'>) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { first_name, last_name, email, phone, preferred_name, gender, date_of_birth, address, emergency_person, emergency_contact } = body;

    const updates = [];
    const vals = [];

    const queries = [];
    let query = '';
    
    
    if (!first_name && !last_name && !email && !phone && !preferred_name && !gender && !date_of_birth && !address && !emergency_person && !emergency_contact){
      return NextResponse.json(
      { error: "Please provide atleast one field to update!" },
      { status: 401 }
      );
    }

    if (first_name) {
      updates.push('first_name = ?');
      vals.push(first_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      vals.push(last_name);
    }
    if (email) {
      updates.push('email = ?');
      vals.push(email);
    }
    if (phone) {
      updates.push('phone = ?');
      vals.push(phone);
    }
    
    if (updates.length>0){
      vals.push(id);
      query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      queries.push({query, params: [...vals]});
      updates.length = 0;
      vals.length = 0;
    }

    if (preferred_name) {
      updates.push('preferred_name = ?');
      vals.push(preferred_name);
    }
    if (gender) {
      updates.push('gender = ?');
      vals.push(gender);
    }
    if (date_of_birth) {
      updates.push('date_of_birth = ?');
      vals.push(date_of_birth);
    }
    if (address) {
      updates.push('address = ?');
      vals.push(address);
    }
    if (emergency_person) {
      updates.push('emergency_person = ?');
      vals.push(emergency_person);
    }
    if (emergency_contact) {
      updates.push('emergency_contact = ?');
      vals.push(emergency_contact);
    }
  
    if (updates.length > 0){
      vals.push(id);
      query = `UPDATE employee_details SET ${updates.join(', ')} WHERE user_id = ?`;
      queries.push({query, params: vals});
    }
  
    if (queries.length > 0){
      const result = await executeTransaction(queries) as any;

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
    }
    else return NextResponse.json(
          { error: "No queries constructed" },
          { status: 402 }
        );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user details:", error);
    return NextResponse.json(
      { error: "Failed to update user details" },
      { status: 500 }
    );
  }
}