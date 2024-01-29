function addtoCart(proId){
    $.ajax({
        url:'/add-to-cart',
        data:{
            product:proId
        },
        method:'post',
        success:(response)=>{
            console.log('success in ajax code'+response)
        }
    })
}