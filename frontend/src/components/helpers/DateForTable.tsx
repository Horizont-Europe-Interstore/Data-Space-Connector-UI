function DateForTable(date:string){
    return date.replace('T', ' ').replace('Z', '');
}

export default DateForTable