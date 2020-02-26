function getPageParameters():any{
    //get current page url
    const url = window.location.href;

    //get the part after question mark with parameters list
    const parametersString = url.split("?")[1]; 

    let parametersObj:any = {};

    if(parametersString){
        // split string to pair parameter=value
        for(let paramPairStr of parametersString.split("&")){
            let paramPair = paramPairStr.split("=");
            parametersObj[paramPair[0]] = paramPair[1];
        }
    }

    //as a result you will have something like this
    // {
    //     appid: f22d7a50-53fa-42c7-93d3-fd2526e23055,
    //     pagetype: entityrecord,
    //     etn: contact,
    //     id: 77ffee28-1e8f-453f-8d51-493442bbb327
    // }

    return parametersObj;
}