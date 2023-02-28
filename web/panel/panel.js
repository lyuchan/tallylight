const socket = new WebSocket('ws://localhost:80');

// when WebSocket connected
socket.addEventListener('open', event => {
    console.log('Connected to server');
    socket.send(JSON.stringify({ get: 'tallyip', }));
});

// when WebSocket connection failed
// socket.addEventListener('error', event => {
//     swal.fire({
//         title: '錯誤',
//         text: 'WebSocket 連線失敗',
//         icon: 'error',
//         confirmButtonText: '重新整理',
//         allowOutsideClick: false
//     }).then((result) => {
//         if (result.isConfirmed) {
//             location.reload();
//         }
//     })
// });

const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-right',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true
})

function login() {
    const uuid = $("#uuid").val();
    const password = $("#password").val();
    data = {
        get: 'login',
        uuid: uuid,
        password: password
    }
    socket.send(JSON.stringify(data));
}

function atemip() {
    const atemip = $("#atemip").val();
    if (atemip === "") {
        Toast.fire({
            icon: 'error',
            title: '請輸入 ATEM IP'
        })
        return;
    }
    data = {
        get: 'atemip',
        ip: atemip,
    }
    socket.send(JSON.stringify(data));
}

function tallyip() {
    data = {
        get: 'tallyip',
    }
    socket.send(JSON.stringify(data));
}

function find(tip) {
    data = {
        get: 'findtally',
        ip: tip
    }
    socket.send(JSON.stringify(data));
}

function changeid(ip, id) {
    data = {
        get: 'tallylight',
        ip: ip,
        data: id
    }
    socket.send(JSON.stringify(data));
}

socket.addEventListener('message', event => {
    console.log('Message from server ', event.data);
    const data = JSON.parse(event.data);
    if (data.get === 'login') {
        if (data.password) {
            window.location.href = '/panel';
        } else {
            swal.fire("Error", "Wrong password", "error");
        }
    }
    if (data.get === 'atemip') {
        if (data.data) {
            Toast.fire({
                icon: 'success',
                title: '已連線到 ATEM'
            })
        }
    }
    if (data.get === 'findtally') {
        if (data.data) {
            Toast.fire({
                icon: 'success',
                title: '已發送尋找請求'
            })
        }
    }
    if (data.get === 'tallyip') {
        ip = data.ip;
        console.log(ip);
        for (let i = 0; i < ip.length; i++) {
            let template = $('#col-template').text();
            template = template.replace(/{{ip}}/g, ip[i]).replace(/{{id}}/g, i + 1);
            $('#table-list').append(template);
        }
    }
    if (data.get === 'tallylight'){
        if (data.data === 'ok'){
            Toast.fire({
                icon: 'success',
                title: '變更成功'
            })
        }
    }
});

function setTally(ip) {
    Swal.fire({
        title: ip,
        html: $('#selectbox-template').text(),
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        preConfirm: () => {
            const select = parseInt(Swal.getPopup().querySelector('#opt').value);
            if (!select) {
                Swal.showValidationMessage(`請選擇一個選項`)
                return;
            }
            changeid(ip, select);
            return;
        }
    })
}

function reloadTally(){
    $('#table-list').empty();
    tallyip();
    Toast.fire({
        icon: 'success',
        title: '已重新整理'
    })
}