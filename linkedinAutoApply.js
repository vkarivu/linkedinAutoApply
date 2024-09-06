// ==UserScript==
// @name         LinkedIn AutoApply Script with EasyApply Handling
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Automatically click job cards and handle EasyApply popups on LinkedIn, with debugging and exit functionality
// @author       You
// @match        https://www.linkedin.com/jobs/search/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Global flag to control execution
    window.stopJobClicks = false;

    // Sleep function using Promises



    function findFirstVisibleElement() {
    // List of element selectors
    const elements = [
        "[id*='dialog-label-']",  // Dialog label elements
        "[id*='jobs-apply-header']",  // Jobs apply header
        "[class*='artdeco-modal__content']",  // Modal content
        "[id='job-details'] > [class='job-details-module__content']",  // Job details content
        "[class='jobs-search-results-list__title-heading']"  // Job search results list title
    ];

    // Iterate through the list and return the first element that is present on the screen
    for (let selector of elements) {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`Found visible element: ${selector}`);
            return element;  // Return the first found element
        }
    }

    // If no element is found, return null
    console.log("No elements found on the current screen.");
    return null;
}



    function randomScroll() {
        console.log("Rondom Scroll happening");
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);
    window.scrollBy(x, y);
}


    async function clickElement() {
        console.log("Rondom Click happening");
        let element = findFirstVisibleElement()
    const rect = element.getBoundingClientRect();
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;
    const clickEvent = new MouseEvent('click', {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(clickEvent);
    }


    function randomHover() {
        console.log("Rondom Hover happening");
        let element = findFirstVisibleElement()
    const hoverEvent = new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true
    });
    element.dispatchEvent(hoverEvent);
}


    async function randomPause() {
        console.log("Rondom Pause happening");
    const shouldPause = Math.random() > 0.9; // 10% chance of pausing
    if (shouldPause) {
        console.log("Taking a random pause.");
        const ms1 = Math.floor(Math.random() * 3000)+2000
        return new Promise(resolve => setTimeout(resolve, ms1));
    }
}


    const actions = [
    randomScroll,
    clickElement,
    randomHover,
    randomPause
];

// Function to choose a random action
async function chooseRandomAction() {
    const randomIndex = Math.floor(Math.random() * actions.length);
    const randomAction = actions[randomIndex];
    console.log(`Executing action at index ${randomIndex}`);
    await randomAction();
}


      function sleep(ms) {
        chooseRandomAction()
        chooseRandomAction()
        const ms1 = Math.floor(Math.random() * 3000)+2000
        return new Promise(resolve => setTimeout(resolve, ms1));
    }





// Use the function where necessary
chooseRandomAction();




    // Function to handle the Easy Apply popup process
    async function handleEasyApplyPopup() {
        try {
console.log("Entered function handleEasyApplyPopup");


              const easyApplyButton = document.querySelector('button.jobs-apply-button');
        if (easyApplyButton) {
            easyApplyButton.click();
            console.log("Clicked Easy Apply button.");
            await sleep(2000); // Wait for the popup to load
        } else {
            console.log("Easy Apply button not found.");
            return;
        }



            let percentage = 0;
            let alertCount = 0; // Counter for alert messages

            // Loop through the steps until reaching the Submit button
            while (percentage < 100) {
                if (window.stopJobClicks) {
                console.log("Execution stopped manually.");
                return;
            }
                const nextButton = document.querySelector('button[aria-label="Continue to next step"], button[aria-label="Review your application"]');
 console.log("handleEasyApplyPopup started");
                // Check for any alert messages
                while (true) {
                    const alertMessage = document.querySelector('span.artdeco-inline-feedback__message');
                    if (alertMessage) {
                        alertCount++;
                        console.log(`Error message found (${alertCount} time(s)), waiting for 3 seconds before retrying.`);
                        await sleep(3000); // Wait before trying again

                        // If alert message appears more than 3 times, cancel the current application
                        if (alertCount > 1) {
                            console.log("Alert appeared more than 3 times, canceling the current application.");
                            saveCrntApplication();
                            return;
                        }
                    } else {
                        break; // No alert message, continue with the process
                    }
                }

                if (nextButton) {
                    nextButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    nextButton.click();
                    console.log("Clicked Next/Review button.");
                    await sleep(3000); // Wait for the next step to load
                } else {
                    console.log("Next/Review button not found.");
                    break;
                }

                // Check if there is a percentage increase
                const percentageElement = document.querySelector('span.artdeco-completeness-meter-linear-view');
                if (percentageElement) {
                    const newPercentage = parseInt(percentageElement.textContent.replace('%', ''));
                    if (newPercentage > percentage) {
                        console.log(`Progress increased to ${newPercentage}%.`);
                        percentage = newPercentage;
                    }
                }
            }

            // If we're on the review step, click Submit
            const submitButton = document.querySelector('button[aria-label="Submit application"]');
            if (submitButton) {
                submitButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                submitButton.click();
                console.log("Clicked Submit button.");
                await sleep(2000); // Wait for submission to complete
            }

            // After submitting, close the popup
            const closeButton = document.querySelector('button.artdeco-modal__dismiss');
            if (closeButton) {
                closeButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                closeButton.click();
                console.log("Closed the popup after submission.");
                await sleep(2000); // Wait for the popup to close
            }

            // Wait for 'See Application' button to appear
            const seeApplicationButton = document.querySelector('a.jobs-s-apply__application-link');
            if (seeApplicationButton) {
                console.log("Application successfully submitted. 'See Application' button is visible.");
            } else {
                console.log("'See Application' button not found.");
            }
        } catch (error) {
            console.error("Error in handling Easy Apply popup:", error);
        }
    }

    // Method to save the current application in case of error
    async function saveCrntApplication() {
        try {
            if (window.stopJobClicks) {
                console.log("Execution stopped manually.");
                return;
            }
            // Step 1: Click on the Cancel button (Dismiss)
            const cancelButton = document.querySelector('button[aria-label="Dismiss"]');
            if (cancelButton) {
                cancelButton.click();
                console.log("Clicked Cancel button (Dismiss).");
                await sleep(2000); // Wait for the confirmation modal to appear
            } else {
                console.log("Cancel button not found.");
                return;
            }

            // Step 2: Wait for and click the 'Save' button in the confirmation dialog
            const saveButton = document.querySelector('button[data-control-name="save_application_btn"]');
            if (saveButton) {
                saveButton.click();
                console.log("Clicked Save button to save the application.");
                await sleep(2000); // Wait for the save action to complete
            } else {
                console.log("Save button not found.");
                return;
            }

            // Step 3: Wait for the 'Continue' button to appear and click it
            const continueButton = document.querySelector('button[aria-label="Continue applying"], span.artdeco-button__text');
            if (continueButton) {
                continueButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                console.log("Continue button Presesnt");
                await sleep(2000); // Wait for the next step to load
            } else {
                console.log("Continue button not found.");
            }
        } catch (error) {
            console.error("Error in saving the current application:", error);
        }
    }





    async function goToNextPage() {
    try {
        // Find the pagination container
        let paginationContainer = document.querySelector('.artdeco-pagination__pages');

        if (!paginationContainer) {
            console.log("Pagination container not found.");
            return false; // No pagination present
        }

        // Find the currently active (darkened) page
        let activePage = paginationContainer.querySelector('button[aria-current="true"]');

        if (!activePage) {
            console.log("Current active page not found.");
            return false; // No active page found
        }

        // Check for the next sibling page in the list
        let nextPage = activePage.closest('li').nextElementSibling;

        if (nextPage && nextPage.querySelector('button')) {
            // Scroll the next page button into view and click it
            let nextPageButton = nextPage.querySelector('button');
            nextPageButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(1000); // Wait for scroll to complete
            nextPageButton.click();
            console.log("Clicked next page.");
            return true; // Successfully clicked next page
        } else {
            console.log("No more pages available.");
            return false; // No next page
        }
    } catch (error) {
        console.error("Error while navigating to the next page:", error);
        return false; // Return false on error
    }
}



async function checkBlockListCompany() {
    const blocklistCompanies = ['cognet', 'advance aero', 'jobot', 'flexton', 'infovision'];
    // Get the company name for the current job card
    const companyElement = document.querySelector('.job-details-jobs-unified-top-card__company-name a');
    const companyName = companyElement ? companyElement.textContent.toLowerCase().replace(/\s+/g, '').trim() : '';

    // Function to normalize company names by removing spaces and converting to lowercase
    const normalizeCompanyName = (company) => company.toLowerCase().replace(/\s+/g, '').trim();

    // Log and compare the company name against the blocklist
    for (const blocked of blocklistCompanies) {
        const normalizedCompanyName = normalizeCompanyName(companyName);
        const normalizedBlockedCompany = normalizeCompanyName(blocked);

        console.log(`Comparing: "${normalizedCompanyName}" with "${normalizedBlockedCompany}"`);

        if (normalizedCompanyName.includes(normalizedBlockedCompany)) {
            console.log(`Skipping job card from company: ${companyName}`);
            return true; // Return true if the company is blocklisted
        }
    }

    return false; // Return false if the company is not blocklisted
}


    async function checkJobDescription() {
    // Define the list of keywords to search for in the job description
    //const keywordList = ['java', 'springboot'];
         const keywordList = ['j'];

    // Get the job description element
    const jobDescriptionElement = document.querySelector('.jobs-description__container');
    if (!jobDescriptionElement) {
        console.log("Job description element not found.");
        return true;
    }

    // Get the text content of the job description and normalize it (convert to lowercase, remove extra spaces)
    //const jobDescriptionText = jobDescriptionElement.textContent.toLowerCase().replace(/\s/g, ' ').trim();

    // Check if all the keywords from the list are present in the job description
    //console.log(`jobDescriptionText1 vals is ${jobDescriptionText}`);
    //const allKeywordsPresent = keywordList.every(keyword => jobDescriptionText.includes(keyword.toLowerCase()));

        // Get the text content of the job description and normalize it (convert to lowercase, remove all spaces)
const jobDescriptionText = jobDescriptionElement.textContent.toLowerCase().replace(/\s+/g, '').trim();

// Check if all the keywords from the list are present in the job description
console.log(`jobDescriptionText vals is ${jobDescriptionText}`);
const allKeywordsPresent = keywordList.every(keyword => jobDescriptionText.includes(keyword.toLowerCase()));


    // Log the result for debugging
    if (allKeywordsPresent) {
        console.log("All keywords found in the job description.");
    } else {
        console.log("Some keywords are missing from the job description.");
    }

    // Return true if all keywords are present, otherwise return false
    return allKeywordsPresent;
}




    // Function to click job cards in the left panel and trigger the Easy Apply process
  async function clickJobCardsAndApply() {
    // Declare blocklist companies


    // Find the job list panel
    let jobListPanel = document.querySelector('.scaffold-layout__list-container');

    if (!jobListPanel) {
        console.log("Job list panel not found.");
        return;
    }

    // Step 1: Scroll the left panel all the way to the bottom to load all jobs
    let lastScrollTop = jobListPanel.scrollTop;
    let currentScrollTop = jobListPanel.scrollTop;

    // Keep scrolling down until the scroll position stops changing (i.e., we've reached the bottom)
    while (lastScrollTop !== currentScrollTop) {
        jobListPanel.scrollTop += 500; // Scroll down by 500px at a time
        lastScrollTop = currentScrollTop;
        currentScrollTop = jobListPanel.scrollTop;

        console.log("Scrolling down...");
        await sleep(1000); // Wait for new jobs to load
    }

    // Now get the list of job cards in the panel
    let jobCards = document.querySelectorAll('.jobs-search-results__list-item');

    for (let i = 0; i < jobCards.length; i++) {
        if (window.stopJobClicks) {
            console.log("Execution stopped manually.");
            break;
        }



        // Scroll the job card into view manually by adjusting the scroll position
        jobCards[i].scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Click on the job card
        const anchor = jobCards[i].querySelector('a.job-card-list__title');
        if (anchor) {
            anchor.click();
            console.log(`Clicked job card anchor number ${i + 1}`);
        } else {
            console.log(`No anchor link found for job card at index ${i}`);
            continue;
        }

        // Wait for 1.5 seconds before handling Easy Apply popup
        await sleep(1500);

        // Handle the Easy Apply popup
       let spdvals = await checkBlockListCompany();
console.log(`spdvals is ${spdvals}`);
        if(spdvals){
            console.log("SSSSOO REached function handleEasyApplyPopup");
            continue;
        }

               let spdvals1 = await checkJobDescription();
        console.log(`spdvals is ${spdvals1}`);
        if(!spdvals1){
            console.log("SSSSPPP REached function handleEasyApplyPopup");
            continue;
        }



console.log("REached function handleEasyApplyPopup");


        await handleEasyApplyPopup();
    }

    console.log("Finished processing all job cards or stopped manually.");
}




    // Expose the functions to the global window object
    window.startJobAutoApply = async function() {
    window.stopJobClicks = false;  // Reset the stop flag

    // Initial execution of clickJobCardsAndApply
    await clickJobCardsAndApply();

    // Loop through pages and process job cards on each page
    while (!window.stopJobClicks) {
        const hasNextPage = await goToNextPage();  // Check if there is a next page
        if (hasNextPage) {
            console.log("Navigated to the next page, continuing with job applications.");
            await sleep(2000);  // Wait for the next page to load
            await clickJobCardsAndApply();  // Apply on the new page
        } else {
            console.log("No more pages to process.");
            break;  // Exit the loop if there are no more pages
        }
    }

    console.log("Finished processing all pages or stopped manually.");
};

    window.stopJobAutoApply = function() {
        window.stopJobClicks = true;  // Set the stop flag
    };

})();
