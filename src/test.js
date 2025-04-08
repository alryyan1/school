let buffer = new ArrayBuffer(8)
//allocate memory of 8 bytes prefilled with zero
let unit8array = new Uint8Array()   // 8 bit unsigned integers 0-255
let int32array = new Int32Array()
let float64array = new Float64Array()
console.log(buffer,unit8array,int32array)
let view = new DataView()
view.setInt16()


