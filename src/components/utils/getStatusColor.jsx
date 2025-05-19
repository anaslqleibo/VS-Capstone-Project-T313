function getStatusColor(status="open-shift"){
    const shiftStatus = ["unaccepted", "accepted", "leave", "open-shift"]
    const notificationStatus = []
    // List is just used to show all the available states, can be deleted later
    // TODO: Can add notif status and other status aswell here

    switch(status){
        case "unaccepted":
        case "warning":
            return "var(--warning-color)";
        case "request":
            return "var(--secondary-color)";
        case "accepted":
            return "var(--primary-color)";
        case "leave":
            return "var(--dark-grey)";
        case "open-shift":
            return "var(--hover-color)";
        case "declined-shift":
        case "danger":
            return "var(--danger-color)";
        default:
            return "var(--light-grey)";
    }
}

export default getStatusColor;