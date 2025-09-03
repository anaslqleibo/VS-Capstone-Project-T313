import { ShiftStatus } from "@/app/controllers/Shifts";

export enum Status {
    Pending = 'Pending',
    Unassigned = 'Unassigned',
    Accepted = 'Accepted',
    Leave = 'Leave',
    OpenShift = 'Open',
    Request = 'Request',
    DeclinedShift = 'Declined',
    Unavailable = 'Unavailable',
}

export function stringToStatus(status: string): Status {
    switch (status) {
        case 'Pending':
            return Status.Pending;
        case 'Unassigned':
            return Status.Unassigned;
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
        default:
            return Status.Unavailable;
    }
}

export function statusToString(status: Status): ShiftStatus {
    switch (status) {
        case Status.Pending:
            return 'Pending';
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
        default:
            return 'Pending';
    }
}

function getStatusColor(status:Status, returnHex:boolean=true){
    if (returnHex){
        switch(status){
            case Status.Pending:
            case Status.Unassigned:
                return "var(--warning-color)";
            case Status.Request:
                return "var(--secondary-color)";
            case Status.Accepted:
                return "var(--primary-color)";
            case Status.Leave:
                return "var(--dark-grey)";
            case Status.OpenShift:
                return "var(--hover-color)";
            case Status.DeclinedShift:
                return "var(--danger-color)";
            default:
                return "var(--light-grey)";
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
            case Status.OpenShift:
                return "var(--hover-color-rgb)";
            case Status.DeclinedShift:
                return "var(--danger-color-rgb)";
            default:
                return "var(--light-grey-rgb)";
        }
    }
    
}

export default getStatusColor;