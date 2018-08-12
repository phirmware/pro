if(navigator.serviceWorker){
    navigator.serviceWorker.register('./sw.js').then((reg)=>{
        console.log('Service Worker Registered');
        if(!navigator.serviceWorker.controller){
            return;
        }
        if(reg.installing){
            self.addEventListener('statechange',function(event){
                if(event.state == 'installed'){
                    alert('Update ready!!');
                    return;
                }
            })
        }
    }).catch(()=>{
        console.log('Service Worker failed to register');
    });
}