const creds = require('./money-338906-be87dc23d7cd.json');
const {GoogleSpreadsheet} = require('google-spreadsheet');

const __OZWORKS_SHEETS__ = '1-9y_dtuK7I4BYWD_Vd4UIilqJyVtZuFGUr0midBd_OY';
const __OUR_MONEY__ = '1a_uHZ-9wrYzSTQ5EBX8_h1DWJf4-bfOY_P7w48GBiBM';
const __KEYS__ = ['type', 'user', 'credit', 'category', 'store', 'amount', 'meno', 'tags'];

(async () => {

    const doc = new GoogleSpreadsheet(__OUR_MONEY__);
    await doc.useServiceAccountAuth(creds);    
    
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['_202112'];
    
    const rows = await sheet.getRows();
    const moneyStacks = {
        outcome: 0,
        income: 0,
        byType: [],
        byUser: [],
        byCredit: [],
        byCategory: [],
        byStore: [],
        byTags: [],
        rawData: [],
    };
    const mergePrice = (type, key, value = 0) => {
        const index = moneyStacks[type].findIndex(tuple => tuple[0] === key);
        if ( index === -1 ) {
            moneyStacks[type].push([key, value]);
        } else {
            moneyStacks[type][index][1] += value;
        }
    }
    rows.slice(2).map((data, i) => {
        const amount = Number(data.amount.replace(',', '')) || 0;
        mergePrice('byType', data.type, amount);
        mergePrice('byUser', data.user, amount);
        mergePrice('byCredit', data.credit, amount);
        
        data.category.split('/').reduce((prev, current) => {
            const nowCategory = prev ? `${prev}/${current}` : current;
            mergePrice('byCategory', nowCategory, amount);
            return nowCategory;
        }, '');

        mergePrice('byStore', data.store, amount);

        const tags = (data.tags || '').split(' ').map(tag => tag.replace('#', ''));

        if (data.type.indexOf('수입') > -1) {
            moneyStacks.income += amount;
        } else {
            moneyStacks.outcome += amount;
        }

        moneyStacks.rawData.push({
            type: data.type,
            user: data.user,
            credit: data.credit,
            category: data.category,
            amount,
            tags,
            memo: data.memo || ''
        });

        // console.log(i, data.type, data.user, data.credit, data.category, Number(data.amount.replace(',', '')));
    })

    console.log("DATA", moneyStacks.byCategory);
    
})();