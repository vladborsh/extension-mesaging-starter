var log = (data) => {
    console.log( data );
}

var logH = (data) => {
    console.log( `%c${data}`,  'color: #478fc6; font-weight: bold; font-size:105%;');
}

export { log, logH }
