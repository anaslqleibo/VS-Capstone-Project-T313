import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { verifyAPIToken } from "@/app/lib/auth";

export async function PATCH(request: NextRequest, context: RouteContext<'/api/users/[id]/update_pay_rate'>) {
  try {
    const tokenRes = await verifyAPIToken(request);
    if (!tokenRes.ok) return tokenRes;
        
    const { id } = await context.params;
    const { job_title, age_group, level, specialty } = await request.json();
    
    if (!job_title || !age_group || !level){
      return NextResponse.json(
      { error: "Please provide all required field of pay rate!" },
      { status: 401 }
      );
    }

    let payrate;
    if (specialty && specialty !== '-'){
        payrate = await executeQuery(`SELECT id FROM pay_rates WHERE job_title = ? AND age_group = ? AND level = ? AND specialty = ?`, [job_title, age_group, level, specialty]);
    }
    else{
        payrate = await executeQuery(`SELECT id FROM pay_rates WHERE job_title = ? AND age_group = ? AND level = ? AND specialty IS NULL `, [job_title, age_group, level]);
    }
    const payrateId = payrate as any[];
    if (payrateId.length === 0) {
      return NextResponse.json(
        { error: "Pay rate not found" },
        { status: 404 }
      );
    }
    
    const detailsExist = await executeQuery('SELECT user_id FROM employee_details WHERE user_id = ?', [id]) as any[];

    let result:any;
    if (detailsExist.length === 0){
        result = await executeQuery('INSERT INTO employee_details (user_id, pay_rate_id) VALUES (?,?)', [id, payrateId[0].id]) as any;
    }
    else{
        result = await executeQuery('UPDATE employee_details SET pay_rate_id = ? WHERE user_id = ?', [payrateId[0].id, id]) as any;
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Employee details not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      pay_rate_id: payrateId[0].id,
      message: "Pay rate assigned/updated successfully"
    });

  } catch (error) {
    console.error("Error updating user's pay rate:", error);
    return NextResponse.json(
      { error: "Failed to update user's pay rate" },
      { status: 500 }
    );
  }
}