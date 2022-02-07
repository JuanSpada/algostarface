const myAlgoWallet = new MyAlgoConnect();
async function connectToMyAlgo() {
  try {
    const accounts = await myAlgoWallet.connect();
    const addresses = accounts.map((account) => account.address);
    console.log(addresses[0]);
    let data = {
      walletId: addresses[0],
      participo: 1,
      completed: false,
    };
    fetch(window.location.href, {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response)
    .then(data => {
      window.location.href = window.location.href;
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  } catch (err) {
    console.error(err);
  }
}

async function connectToMyAlgoAdmAuth() {
  try {
    const accounts = await myAlgoWallet.connect();
    const addresses = accounts.map((account) => account.address);
    console.log(addresses[0]);
    let data = {
      walletId: addresses[0],
      participo: 1,
      completed: false,
    };
    fetch(window.location.href, {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response)
    .then(data => {
      window.location.href = window.location.origin+"/admin";
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  } catch (err) {
    console.error(err);
  }
}