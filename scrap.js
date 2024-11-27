const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');  

(async () => {
    try {
        const main = {
            uri: 'https://www.nepalicars.com/en/vehicle_listings/',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            },
            gzip: true
        };

        // Fetch
        const response = await request(main);
        // Load
        const $ = cheerio.load(response);

        let carListing = [];

        $('div[class = "ads-lists"] > a').each((i, el) => {
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
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
                    },
                    gzip: true,
                };

                
                const carPageResponse = await request(carPage);
                const $car = cheerio.load(carPageResponse);

                
                const carName = $('div[class="specification-section"] > h4').first().text().trim();
                const location = $('div[class="location"]').first().text().trim();
                const price = $car('div[class="value"] span').first().text().trim();
                const phoneNumber = $('div[class="phone-wrapper"] span').first().text().trim();

        
                const carDetails = {
                    carName ,
                    location,
                    price,
                    phoneNumber,
                    listingURL ,
        };

        allCars.push(carDetails);
                

            } catch (error) {
                console.error(`Error fetching details for car: ${carLink}`, error.message);
            }
        }

        // Write all car listings to a JSON file after the loop finishes
        fs.writeFileSync('car_listings.json', JSON.stringify(allCars, null, 2), 'utf8');
        

    } catch (error) {
        console.error('Your code sucks ', error.message);
    }
})();
