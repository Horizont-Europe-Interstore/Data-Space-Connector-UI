const formatDateFromData = (dateString: string):string =>{
    let formattedDate = dateString.replace(' ', 'T').slice(0, 16);
    return formattedDate;}
export default formatDateFromData;