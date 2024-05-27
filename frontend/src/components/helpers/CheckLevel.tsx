type ExpandedFiltersByLevel = { [level: number]: string | null };

function checkLevel(value:string, filterArray:ExpandedFiltersByLevel, parrent:string) {
    const values = Object.values(filterArray);
        if (values.length >0 &&  !values.includes(parrent)) {
          return true;
        }
  }

export default checkLevel ;