const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {

    const main = {
        uri: 'https://www.nepalicars.com/en/vehicle_listings/',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
        gzip : true,
     }
     const response = await request(main);
     $ = cheerio.load(response);

     const CarName = $('div.specification-section h4').first().text().trim();
     const CarLocation = $('div.location').first().text().trim();
     const CarPrice = $('div.value span').first().text().trim();

     const carDetails = {
        Name : CarName,
        Location: CarLocation,
        Price : CarPrice,
        Contact : null,
        ListingURL : null
     }


     let allCars = []
     let carListing =[]


     $('div[class="ads-lists"] > a').each((i, el) => {
        const carLink = $(el).attr('href');
        if (carLink) {
            carListing.push(`https://www.nepalicars.com${carLink}`);
        }
    });
    

    for(const carLink of carListing){
        const carPage = {
            uri: carLink,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            },
            gzip : true,
        };

        const carPageResponse = await request(carPage);
        $page = cheerio.load(carPageResponse);

        const phoneNum = $page('div.phone-wrapper span').first().text().trim();
        carDetails.Contact = phoneNum;
        carDetails.ListingURL = carLink;
        }

        allCars.push(carDetails);

        fs.writeFileSync('carinfo.json', JSON.stringify(allCars, null, 2), 'utf8');
        console.log('Car listings saved to carinfo.json');
})();