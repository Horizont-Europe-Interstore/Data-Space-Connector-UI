export function ChangingOrder(oldValue: string) {
    console.log(oldValue)
    let newValue = ""
    if (oldValue === "desc") {
        newValue = "asc"
    } else if (oldValue == "") {
        newValue = "desc"
    } else {
        newValue = "desc"
    }
    return newValue;
}

