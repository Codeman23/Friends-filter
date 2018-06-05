export default function workingFriends() {
    VK.init({
        apiId: 6497847
    });

    function auth() {
        return new Promise((resolve, reject ) => {

            VK.Auth.login(data => {
                if (data.session) {
                    resolve();
                } else {
                    reject(new Error('Ошибка'));
                }
            },2);
        });
    }

    function callAPI(method, params) {
        params.v = '5.76';

        return new Promise((resolve, reject ) => {
            VK.api(method, params, (data) => {
                if (data.error) {
                    reject(data.error);
                } else {
                    resolve(data.response);
                }
            });
        });
    }

    (async () => {
        try {
            await auth();

            const friends = await callAPI('friends.get', { fields: 'photo_100', count: 30 });

            if (localStorage.getItem('array')) {
                arrays.rightItems = JSON.parse(localStorage.getItem('array'));

                for(var i = 0; i < friends.items.length; i++){
                    for(var j = 0; j < arrays.rightItems.length; j++) {

                        if(friends.items[i].id == arrays.rightItems[j].id) {
                            friends.items.splice(i, 1)
                        }
                    }
                }
                arrays.leftItems = friends.items.slice();
                refresh(arrays.rightItems, 'right-column');

            } else {
                arrays.leftItems = friends.items.slice();
            }

            const loadingInput = document.querySelector('.input_search');
            const chosenInput = document.querySelector('.input-friends-save');

            const filterFriends = () => {

                const from = document.querySelector('.friends-wrapper_left');
                const to = document.querySelector('.friends-wrapper_right');
                const friendsFrom = from.querySelectorAll('.friends-item__title');
                const friendsTo = to.querySelectorAll('.friends-item__title');

                function filterNames(source, input) {
                    for (const friend of source) {
                        const friendLower = friend.textContent.toLowerCase();

                        if ( !(friendLower.includes(input.value))) {
                            friend.parentElement.classList.add('hidden');
                        } else {
                            friend.parentElement.classList.remove('hidden');
                        }
                    }
                }

                filterNames(friendsFrom,loadingInput);
                filterNames(friendsTo,chosenInput);
            };

            loadingInput.addEventListener('input', filterFriends);
            chosenInput.addEventListener('input', filterFriends);

            refresh(arrays.leftItems, 'left-column');
            onButton();

        } catch (e) {
            console.log(e);
        }

    })();

    var arrays= {
        leftItems: [],
        rightItems: []
    };

    function refresh(friends, column) {
        const template = document.querySelector('#user-template').textContent;
        const render = Handlebars.compile(template);
        const html = render(friends);
        const wrapper = document.querySelector(`.${column} .friends-wrapper`);

        wrapper.innerHTML = html;

        friends.forEach((item) => {
            document.querySelector(`[data-id='${item.id}']`).item = item.id;
        });
    }

    function onButton () {
        let leftZone = document.querySelector('.left-column .friends-wrapper');
        let rightZone = document.querySelector('.right-column .friends-wrapper');

        document.addEventListener('click', (e) => {

            let currentBtn = getCurrentZone(e.target, 'js-button');

            if (currentBtn) {
                if (currentBtn.classList.contains('button-item')) {
                    if (getCurrentZone(currentBtn, 'left-column')) {
                        let currentItem = getCurrentZone(currentBtn, 'friends-item');

                        changeColumn(currentItem, 'left');
                        rightZone.appendChild(currentItem);
                    } else {
                        let currentItem = getCurrentZone(currentBtn, 'friends-item');

                        changeColumn(currentItem, 'right');
                        leftZone.appendChild(currentItem);
                    }
                }

                if(currentBtn.classList.contains('button-save')) {
                    localStorage.setItem('array', JSON.stringify(arrays.rightItems))
                }
            }
        });
    }

    function changeColumn(currentItem, column){
        let currentColumn = column === 'left' ? arrays.leftItems : arrays.rightItems;
        let siblingColumn = column === 'left' ? arrays.rightItems : arrays.leftItems;

        for(let i in currentColumn) {
            if(currentColumn[i].id === currentItem.item){
                siblingColumn.push(currentColumn[i]);
                currentColumn.splice(i,1);
            }
        }
    }

    let currentDrag;

    document.addEventListener('dragstart', (e) => {
        const zone = getCurrentZone(e.target, 'friends-wrapper');

        if (zone) {
            currentDrag = { startZone: zone, node: e.target };
            currentDrag.node.classList.add('friends-item_active');
        }
    });

    document.addEventListener('dragover', (e) => {
        const zone = getCurrentZone(e.target, 'friends-wrapper');

        if (zone) {
            e.preventDefault();
        }
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();

        if (currentDrag) {
            const zone = getCurrentZone(e.target, 'friends-wrapper');

            e.preventDefault();

            if (zone && currentDrag.startZone !== zone) {
                zone.appendChild(currentDrag.node);

                currentDrag.node.classList.remove('friends-item_active');
                changeColumn(currentDrag.id, currentDrag.column)
            }
            currentDrag = null;
        }
    });

    function getCurrentZone(from, zone) {

        if(from == null || from.classList.contains(zone)){

            return from;
        } else {

            return getCurrentZone(from.parentElement, zone);
        }
    }
}