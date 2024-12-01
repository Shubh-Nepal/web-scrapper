const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
    try {
        const baseURL = 'https://www.nepalicars.com/buy-cars?page=';
        const allCars = [];

        // Loop through pages 1 to 57
        for (let pages = 1; pages <= 57; pages++) {
            const mainPage = {
                uri: `${baseURL}${pages}`,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                },
                gzip: true,
            };

            const mainPageResponse = await request(mainPage);
            const $ = cheerio.load(mainPageResponse);

            // Extract car details from the current page
            $('div.ads-lists > a').each((_, el) => {
                const carLink = $(el).attr('href');
                const carName = $(el).find('h4').text().trim();
                const carLocation = $(el).find('div.location').text().trim();
                const carPrice = $(el).find('div.value span').first().text().trim() || 'NEGOTIABLE';

                if (carLink) {
                    allCars.push({
                        Name: carName,
                        Location: carLocation,
                        Price: carPrice,
                        Contact: null, // Placeholder for contact
                        ListingURL: `https://www.nepalicars.com${carLink}`,
                    });
                }
            });
        }

        // Process each car to fetch contact details
        for (const car of allCars) {
            try {
                const carPageOptions = {
                    uri: car.ListingURL,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    },
                    gzip: true,
                };

                const carPageResponse = await request(carPageOptions);
                const $page = cheerio.load(carPageResponse);

                car.Contact = $page('div.phone-wrapper span').first().text().trim() || 'Not available';
            } catch (error) {
                console.error(`Error fetching details for ${car.ListingURL}:`, error.message);
                car.Contact = 'Error fetching contact';
            }
        }

        // Save all car listings to a JSON file
        fs.writeFileSync('CARS.json', JSON.stringify(allCars, null, 2), 'utf8');
        console.log('Car listings saved to CARS.json');
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
})();
