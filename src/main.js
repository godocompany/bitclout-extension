function main() {

    // Start an interval checking the URL
    setInterval(() => {

        document
            .querySelectorAll('left-bar-button a')
            .forEach(a => {
                if (a.parentElement.textContent === 'Profile') {
                    const editBtn = document.createElement('span');
                    editBtn.classList.add("__godo_profile-edit-link");
                    editBtn.innerHTML = '&nbsp;(<a href="/update-profile">Edit</a>)'
                    a.parentElement.appendChild(editBtn);
                }
            })

    }, 500);

    // Track the url
    let prev_url = null;
    let page_cleanup_fn = null;

    // Start an interval checking the URL
    setInterval(() => {

        // Get the page url
        let url = document.location.pathname;
        if (!url || url !== prev_url) {
            const parts = url.split('/').filter(p => p.trim().length > 0);
            const new_page_cleanup_fn = loadedPage(parts);
            if (new_page_cleanup_fn) {
                if (typeof page_cleanup_fn === 'function') page_cleanup_fn();
                prev_url = url;
                page_cleanup_fn = new_page_cleanup_fn;
            }
        }

    }, 100);

}

function loadedPage(path) {
    if (path[0] === 'u' && (path[2] == 'buy' || path[2] == 'trade')) {
        return loadedBuyCreatorCoinPage(path[1]);
    }
    return false;
}

function loadedBuyCreatorCoinPage(username) {

    const anchor_point = document.querySelector('trade-creator-form > div:last-child')
    if (!anchor_point) return false;

    // Add the row for our data
    const row = document.createElement('div');
    row.classList.add('__godo_creator-buy-reward');
    row.innerHTML = '<div><i class="fas fa-spin fa-spinner"></i> <span class="loading">Loading...</span></div>';
    anchor_point.parentElement.insertBefore(row, anchor_point);

    // Get the data for the profile
    getProfileFromUsername(username)
        .then(p => {
            console.log(p);

            const pct = (p.CoinEntry.CreatorBasisPoints / 100).toFixed(2);
            row.innerHTML = [
                `<i class="fas fa-info-circle"></i><b>${username}</b>'s Founder Reward Percentage is <b>${pct}%</b>`,
                `<span class="__godo_credit">Founder Reward Percentage display brought to you by <a href="/u/GoDo">@GoDo</a></span>`,
            ].map(l => `<div>${l}</div>`).join('');

        });


    // Return a cleanup function
    return () => {

    };

}

function getProfileFromUsername(username) {

    return fetch("https://api.bitclout.com/get-profiles", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "sec-gpc": "1"
        },
        "referrerPolicy": "no-referrer",
        "body": JSON.stringify({
            PublicKeyBase58Check: '',
            Username: username,
            UsernamePrefix: '',
            Description: '',
            OrderBy: 'newest_last_post',
            NumToFetch: 1,
            // ReaderPublicKeyBase58Check: 'BC1YLjL2pNMaKst9c23nVPgwemQ2XtAip1QxE9HzxgUBKygNYqhsbHM',
            ModerationType: '',
            FetchUsersThatHODL: true,
            AddGlobalFeedBool: false
        }),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    })
    .then(r => r.json())
    .then(r => r.ProfilesFound[0]);

}

main();
