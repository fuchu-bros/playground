// solitaire 
class Solitaire extends HTMLElement {
    constructor() {
        super();

        this.config = {
            board: {
                theme: "basic"
            },
            card: {
                skin: "basic",
                types: [1, 2, 3, 4],
                maxNumber: 13
            },
            stock: {
                loop: true,
                count: 1
            },
        };

        // define components
        this.shadow = this.attachShadow({mode: 'open'});
        this.board = document.createElement('div');
        this.board.setAttribute('class', 'solitaire-board');


        const themeStyle = document.createElement('style');
        themeStyle.id = 'solitaire_theme';
        themeStyle.innerHTML = `
            .solitaire-board{
                --board-background: green;
            }
        `;

        const style = document.createElement('style');
        style.id = 'solitaire_style';
        style.innerHTML = `
            .solitaire-board{
                position: fixed;top: 0;left: 0;bottom: 0;right: 0;
                background: var(--board-background);
                display: flex;flex-direction: column;
            }

            .solitaire-bottom{
                padding: 10%;
                flex: 1;
                display: flex;justify-content: space-between;align-items: start
            }

            .solitaire-card{
                position: relative;
                padding: 6px;
                width: 80px;height: 120px;
                background: #fff;
                border: 1px solid #ccc;border-radius: 6px;
                box-shadow: 2px 1px 1px rgba(0, 0, 0, .6);
                display: flex;flex-direction: column;justify-content: space-between;
            }
            .solitaire-card span:first-child{text-align: left}
            .solitaire-card span:last-child{text-align: left;transform: rotate(180deg)}
            .solitaire-card + div{margin-top: -128px}
            .solitaire-card.type-1{background: skyblue}
            .solitaire-card.type-2{background: orange}
            .solitaire-card.type-3{background: skyblue}
            .solitaire-card.type-4{background: orange}
            .solitaire-card.flip{background: #dfdfdf}
            .solitaire-card.flip > *{display: none}
        `;

        this.shadow.appendChild(themeStyle);
        this.shadow.appendChild(style);

        this.bottomZone = document.createElement('div');
        this.bottomZone.setAttribute('class', 'solitaire-bottom');

        this.bottomZone.innerHTML = `
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        `;

        this.shadow.appendChild(this.board);
        this.board.appendChild(this.bottomZone);

        this.initBoard();
    }

    initBoard(){
        // Create empty board;
        this.board = [[], [], [], [], [], [], []];
        this.stock = [];
        this.waste = [];
        this.deck = [[], [], [], []];
        this.score = {
            timer: 0,
            moved: 0,
            started: 0,
            finished: 0,
            isCleared: false
        };

        // Make Suffled card stock;
        this.stock = this.makeCardDeck().sort((a, b) => 0.5 - Math.random());

        // print board

        // print stocks

        // dealing stocks
        while(this.board[6].length !== 7){
            this.board.forEach((v, i) => {
                if ( v.length < i + 1 ) {
                    const [cardNumber, cardType] = this.stock.pop();
                    this.board[i].push([cardNumber, cardType]);
                    const card = document.createElement('div');
                    card.setAttribute('class', `
                        solitaire-card ${v.length === i + 1 ? '' : 'flip'}
                        type-${cardType}
                    `);

                    card.innerHTML = `
                        <span>${cardNumber}</span>
                        <span>${cardNumber}</span>
                    `;
                    this.bottomZone.children[i].appendChild(card);
                }
            });
        }
    }
    

    makeCardDeck(){
        const {types, maxNumber} = this.config.card;
        return types.reduce((p, c, i) => {
            const deck = new Array(maxNumber).fill(0).map((val, idx) => {
                return [idx + 1, i + 1];
            });
            return p.concat(deck);
        }, []);
    }


    //----
    connectedCallback() {
        console.log("Connected", this);
    }
}

customElements.define('solitaire-board', Solitaire);