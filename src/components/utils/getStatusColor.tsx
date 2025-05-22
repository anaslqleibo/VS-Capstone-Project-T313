export enum Status {
    Unaccepted,
    Unassigned,
    Accepted,
    Leave,
    OpenShift,
    Request,
    DeclinedShift
}



function getStatusColor(status:Status){
    switch(status){
        case Status.Unaccepted:
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

export default getStatusColor;