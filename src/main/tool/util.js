export function debounce(fn, wait){
  let timer = null
  return function(){
    let args = arguments
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, wait)
  }
}
