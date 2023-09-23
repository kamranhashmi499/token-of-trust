var cartData = []; 
fetch(window.Shopify.routes.root + 'cart.js')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data) {
            var itemIDs = data.items.map(function(item) {
                return item.id;
            });
            if (itemIDs.includes(46610826232098)) {
                var url = window.Shopify.routes.root + 'cart/update.js';
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({
                        updates: {
                            '46610826232098': 0
                        }
                    })
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    window.location.reload();
                })
                .catch(function(error) {
                    console.error('Error:', error);
                });       
            } 
        }
    });
