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
                    gzip: true
                };

                
                const carPageResponse = await request(carPage);
                const $car = cheerio.load(carPageResponse);

                
                carNames = [];
                $('div[class="specification-section"] > h4').each((i, el)=> {
                    const Cname = $(el).text().trim();
                    if(Cname){
                        carNames.push(Cname);
                    }
                });
                carLocation = [];
                $('div[class="location"]').each((i, el)=>{
                    const Loc = $(el).text().trim();
                    if(Loc){
                        carLocation.push(Loc);
                    }
                })
                carPrice = [];
                $('div[class="value"]').each((i, el)=>{
                    const p = $(el).text().trim();
                    if(p){
                        carPrice.push(p);
                    }
                })
                carContact = [];
                $car('div[class="phone-wrapper"] span').each((i, el)=>{
                    const con = $(el).text().trim();
                    if(con){
                        carContact.push(con);
                    }
                })
                
                for(let i = 0; i <= carNames.length - 1; i++){

                const carDetails = {
                    Name: carNames[i],
                    location: carLocation[i],
                    price: carPrice[i],
                    phoneNumber: carContact[i],
                    listingURL: carLink,
                };
                allCars.push(carDetails);
            }
                

                
                

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
