import { ShiftStatus } from "@/app/controllers/Shifts";

/**
 * An enum object of all types of shift
 */
export enum Status {
    Accepted = 'Accepted',
    Pending = 'Pending',
    DeclinedShift = 'Declined',
    Unassigned = 'Unassigned',
    OpenShift = 'Open',
    Request = 'Request',
    Leave = 'Leave',
    Unavailable = 'Unavailable',
    Unpublished = 'Unpublished',
    Assigned = "Assigned",

}

/**
 * Converts a string to a Status object
 * @param status A string that represents a shift status
 * @returns Status object from the string param 'status'
 */
export function stringToStatus(status: string): Status {
    switch (status) {
        case 'Pending':
            return Status.Pending;
        case 'Unassigned':
            return Status.Unassigned;
        case 'Assigned':
            return Status.Assigned;
        case 'Accepted':
            return Status.Accepted;
        case 'Leave':
            return Status.Leave;
        case 'Open':
            return Status.OpenShift;
        case 'Request':
            return Status.Request;
        case 'Declined':
            return Status.DeclinedShift;
        case 'Unpublished':
            return Status.Unpublished;
        default:
            return Status.Unavailable;
    }
}

/**
 * Converts a Status object to its string representation
 * @param status Status object to turn into string
 * @returns A string representing the Status object
 */
export function statusToString(status: Status): ShiftStatus {
    switch (status) {
        case Status.Pending:
            return 'Pending';
        case Status.Assigned:
            return 'Assigned';
        case Status.Unassigned:
            return 'Unassigned';
        case Status.Accepted:
            return 'Accepted';
        case Status.OpenShift:
            return 'Open';
        case Status.Request:
            return 'Request';
        case Status.DeclinedShift:
            return 'Declined';
        case Status.Unpublished:
            return 'Unpublished';
        default:
            return 'Pending';
    }
}

/**
 * Get the unique status color of a shift status
 * @param status Status object of the shift
 * @param returnHex Set to true to return a variable that stores the hex color (use this if you need to apply opacity)
 * @returns A string of a CSS color variable, e.g., "var(--color-primary)" 
 */
function getStatusColor(status:Status, returnHex:boolean=true){
    if (returnHex){
        switch(status){
            case Status.Pending:
            case Status.Unassigned:
                return "var(--color-warning)";
            case Status.Request:
                return "var(--color-secondary)";
            case Status.Accepted:
                return "var(--color-primary)";
            case Status.Leave:
                return "var(--color-dark-grey)";
            case Status.Assigned:
            case Status.OpenShift:
                return "var(--color-hover)";
            case Status.DeclinedShift:
                return "var(--color-danger)";
            case Status.Unpublished:
                return "var(--color-unpublished)";
            default:
                return "var(--color-light-grey)";
        }
    }
    else{
        switch(status){
            case Status.Pending:
            case Status.Unassigned:
                return "var(--warning-color-rgb)";
            case Status.Request:
                return "var(--secondary-color-rgb)";
            case Status.Accepted:
                return "var(--primary-color-rgb)";
            case Status.Leave:
                return "var(--dark-grey-rgb)";
            case Status.Assigned:
            case Status.OpenShift:
                return "var(--hover-color-rgb)";
            case Status.DeclinedShift:
                return "var(--danger-color-rgb)";
            case Status.Unpublished:
                return "var(--unpublished-color-rgb)";
            default:
                return "var(--light-grey-rgb)";
        }
    }
    
}

export default getStatusColor;