const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const waait = require('waait');

const crawlingData = ({
    saveToJSON = true,
    saveToCSV = true,
    query = [],
    display = 10,
    addCategory = []
}) => {

    if ( !query ) return;

    query.forEach((q) => {

        axios({
            method: 'get',
            url: `https://openapi.naver.com/v1/search/shop?query=${encodeURI(q)}&display=${display}`,
            headers: {
                'X-Naver-Client-Id': 'X6bJvPkMh1JcgBOMAp05',
                'X-Naver-Client-Secret': 'ZV3L_FT_nr'
            },
        }).then(async (res) => {
            let jsonResult = [];
            let csvString = '제품번호|제품명|최저가|최고가|브랜드|메이커|제품링크|'+addCategory.join('|');
            
            let count = 0;
            for (let data of res.data.items) {
                count++;
                let {productId, title, lprice, hprice, brand, maker} = data;
                let csvLine = [productId, title, lprice, hprice, brand, maker, `https://search.shopping.naver.com/catalog/${productId}`];
                const detailData = await getDetailWithCatalog(productId);
                jsonResult.push({
                    ...data,
                    details: detailData
                });
                addCategory.forEach(name => {
                    const i = detailData.findIndex(([k, v]) => k === name);
                    if ( i > -1 ) {
                        csvLine.push(detailData[i][1]);
                    } else {
                        csvLine.push('');
                    }
                });
                csvString += "\n" + csvLine.join('|');
    
                console.log(`${q} 검색어 ${count}/${display} 처리완료`);
                await waait(Math.ceil(Math.random() * 1000));
            }
        
            // Save log
            let d = moment().format('YYYYMMDDhmmss');
            const filename = `${q}_${d}`;
    
            saveToJSON && fs.writeFileSync(`./log/${filename}.json`, JSON.stringify(jsonResult));
        
            saveToCSV && fs.writeFileSync(`./csv/${filename}.csv`, csvString, {
                encoding: 'utf-8'
            });
    
            console.log(`--- ${q} 작업이 완료되었습니다.`);
        });
    });

}


const getDetailWithCatalog = async (catalogId) => {
    const ogDescGrap = /<meta property="og:description" content="([^"]*)"\/>/;
    const {data} = await axios({method: 'get',url: 'https://search.shopping.naver.com/catalog/'+ catalogId});

    return ogDescGrap.test(data) ? (() => {
        let [,descText] = ogDescGrap.exec(data);

        return descText.split(', ').map(v => {
            try{
                let [key, val] = v.split(' : ');   
                return [key.trim(), val];
            } catch (err) {
                return [];
            }
        });
    })() : [];
}

// rtx3060
// rtx3080
// 5600x
const searchData = {
    intelc: [
    ],
    amdc: {
        query: ['5600x'],
        display: 10,
        addCategory: [
            'AMD코어',       '코어종류',
            '소켓',          '제조공정',
            '설계 전력',     'L2 캐시',
            'L3캐시',        '지원',
            '구성',          '터보클럭속도',
            '스레드',        '기본클럭',
            '소비전력(TDP)',
        ]
    },
    amdcg: {
        query: ['5600g'],
        display: 10,
        addCategory: [
            '품목',          '특징',         'CPU제조사',
            'CPU',           'CPU종류',      '코어종류',
            '터보부스트',    '램용량',       'SSD용량',
            '그래픽',        '파워',         '램규격',
            '운영체제',      '속도',         'SSD 인터페이스',
            '그래픽 메모리', '단자',         '메인보드',
            '코드명',        '무상AS',       '블루투스',
            '랜',            '확장슬롯',     '카드리더',
            '케이스분류',    '케이스재질',   '색상',
            '정격',          '운영체제 bit', 'HDD용량',
            '사운드 채널',   '출장AS',       '형태',
            '오디오'
        ]
    },
    amdg: [],
    nvidiag: {
        query: ['rtx3060', 'rtx3080'],
        display: 50,
        addCategory: [
            '메모리 종류',   '메모리',
            '메모리 대역폭', '단자',
            '부가기능',      '보조전원',
            '구성품',        '길이',
            '높이',          '쿠다 프로세서',
            '권장파워',      '소비전력',
            '인터페이스',    '칩셋',
            '냉각방식',      '쿨러',
            '메모리클럭',    '부스트클럭',
            '무상AS',        '부스트',
            'LED제어시스템', '속도',
            '용도'
        ]
    },
    ram8g: {
        query: ['램 8기가', '램 16기가'],
        display: 10,
        addCategory: [
            '용량',          '메모리방식',
            '동작속도',      '용도',
            '전압',          '램타이밍(tRAS)',
            '램타이밍(tRP)', '램타이밍(tRCD)',
            '램타이밍(CL)',  'XMP',
            '방열판',        '메모리 규격',
            'LED',           'LED제어시스템',
            'LED동기화'
        ],
    },
};
    
crawlingData(searchData.ram8g);


