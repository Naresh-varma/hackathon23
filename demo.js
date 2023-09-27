const callMe = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('callme1 callback fired')
        return resolve();
    }, 1000);  
});

const callMe2 = () => new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('callme2 callback fired');
        return resolve();
    }, 2000);  
})

let flag = false;
callMe()
    .then(() => {
        if (!false) return callMe2();
    })
    .then(() => {
        console.log('completed');
    })
    .catch(console.error);