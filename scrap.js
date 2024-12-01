const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
    try {
        const main = {
            uri: 'https://www.nepalicars.com/en/vehicle_listings/',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            },
            gzip: true,
        };

        //  main page //
        const response = await request(main);
        const $ = cheerio.load(response);

        let carListing = [];
    

        $('div[class="ads-lists"] > a').each((i, el) => {
            const carLink = $(el).attr('href');
            if (carLink) {
                carListing.push(`https://www.nepalicars.com${carLink}`);
            }
        });

        let allCars = [];

        for (const carLink of carListing) {
            try {
                const carPage = {
                    uri: carLink,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    },
                    gzip: true,
                };

                const carPageResponse = await request(carPage);
                const $car = cheerio.load(carPageResponse);


                const carName = $('div.specification-section h4').first().text().trim();
                const location = $('div.location').first().text().trim();
                const price = $('div.value span').first().text().trim();
                const phoneNumber = $car('div.phone-wrapper span').first().text().trim();
                
                const carDetails = {
                    Name : carName,
                    location : location,
                    price : price,
                    phoneNumber: phoneNumber,
                    listingURL: carLink,
                };

                allCars.push(carDetails);
            } catch (error) {
                console.error(`Error fetching details for car: ${carLink}`, error.message);
            }
        }
       
       
        fs.writeFileSync('allCars.json', JSON.stringify(allCars, null, 2), 'utf8');
        console.log('Car listings saved to car_listings.json');

    } catch (error) {
        console.error('Your code sucks:', error.message);
    }
})();
