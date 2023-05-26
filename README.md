# DriveThruDiet

## 1. Introduction

DriveThruDiet is a web app that uses AI and data intelligence to help users make healthier fast food choices through access to nutritional content, nutrition knowledge, and personalized recommendations based on their nutrition goals.

## 2. Techniques and Libraries:

- Frontend: html5, css3, ejs, jquery6, ajax
- Backend: node.js, express.js
- Database: MongoDB
- External libraries & APIs: Google Places API, OpenAI API, Sweetalert2

## 3. Folder Structure

Contents of the project folder

```bash
├── Procfile                              # Configuration file for deployment
├── databaseConnection.js                 # JavaScript file for handling database connections
├── .gitignore                            # Git ignore file
├── index.js                              # Main entry point JavaScript file
├── package.json                          # Package.json file for managing dependencies
├── utils.js                              # JavaScript utility functions
├── README.md
├── datasets
│   ├── fastfoodnutrition.csv             # Dataset for food items.
│   └── restaurant.csv                    # Dataset for fast food restaurants.
├── public                                # Public directory for static assets
│   ├── css                               # CSS directory for styling files
│   │   ├── 404.css                       # CSS file for 404 page styling
│   │   ├── authentication.css            # CSS file for authentication page styling
│   │   ├── chat.css                      # CSS file for chat page styling
│   │   ├── compare.css                   # CSS file for compare page styling
│   │   ├── easteregg.css                 # CSS file for easter egg page styling
│   │   ├── filter.css                    # CSS file for filter page styling
│   │   ├── formfield.css                 # CSS file for form field styling
│   │   ├── home.css                      # CSS file for home page styling
│   │   ├── index_before_login.css        # CSS file for index page before login styling
│   │   ├── item.css                      # CSS file for item page styling
│   │   ├── login.css                     # CSS file for login page styling
│   │   ├── menu.css                      # CSS file for menu page styling
│   │   ├── mytray.css                    # CSS file for my tray page styling
│   │   ├── navbar.css                    # CSS file for navbar styling
│   │   ├── profile.css                   # CSS file for profile page styling
│   │   ├── restaurant.css                # CSS file for restaurant page styling
│   │   ├── security_questions.css        # CSS file for security questions page styling
│   │   ├── signup_profile.css            # CSS file for signup profile page styling
│   │   └── style.css                     # CSS file for general styling
│   └── images                            # Images directory for storing image assets
│       ├── EasterEgg                     # Directory for Easter Egg images
│       │   ├── burger.png                # Easter Egg burger image
│       │   ├── fries.png                 # Easter Egg fries image
│       │   ├── pizza.png                 # Easter Egg pizza image
│       │   └── taco.png                  # Easter Egg taco image
│       ├── Arbys1.png                    # Arby's restaurant image
│       ├── Burger King1.png              # Burger King restaurant image
│       ├── Chick Fil-A1.png              # Chick Fil-A restaurant image
│       ├── Dairy Queen1.png              # Dairy Queen restaurant image
│       ├── DairyQueen.png                # Dairy Queen logo image
│       ├── Logo-white.png                # White logo image
│       ├── Mcdonalds1.png                # McDonald's restaurant image
│       ├── Sonic1.png                    # Sonic restaurant image
│       ├── Subway1.png                   # Subway restaurant image
│       ├── Taco Bell1.png                # Taco Bell restaurant image
│       ├── arrow.png                     # Arrow image
│       ├── icon-chatbot-inactive.png     # Inactive chatbot icon image
│       ├── icon-chatbot-test.png         # Test chatbot icon image
│       ├── icon-chatbot.png              # Chatbot icon image
│       ├── icon-filter.png               # Filter icon image
│       ├── icon-hamburger1.png           # Hamburger icon image 1
│       ├── icon-hamburger2.png           # Hamburger icon image 2
│       ├── icon-hamburger3.png           # Hamburger icon image 3
│       ├── icon-home-inactive.png        # Inactive home icon image
│       ├── icon-home-test.png            # Test home icon image
│       ├── icon-home.png                 # Home icon image
│       ├── icon-menu-inactive.png        # Inactive menu icon image
│       ├── icon-menu-test.png            # Test menu icon image
│       ├── icon-menu.png                 # Menu icon image
│       ├── icon-profile.png              # Profile icon image
│       ├── icon-search.png               # Search icon image
│       ├── icon-tray-opt.gif             # Optimized tray icon image
│       ├── icon-tray-reverse-opt.gif     # Optimized reverse tray icon image
│       └── icon-tray.png                 # Tray icon image
└── views                                 # Views directory for storing view templates
    ├── js                                # JavaScript directory for view-specific JavaScript files
    │   ├── chat_js.ejs                   # View-specific JavaScript file for chat page
    │   ├── filtered_page_js.ejs          # View-specific JavaScript file for filtered page
    │   ├── find_username_js.ejs          # View-specific JavaScript file for find username page
    │   ├── forgot_js.ejs                 # View-specific JavaScript file for forgot page
    │   ├── home_js.ejs                   # View-specific JavaScript file for home page
    │   ├── item_js.ejs                   # View-specific JavaScript file for item page
    │   ├── login_js.ejs                  # View-specific JavaScript file for login page
    │   ├── menu_js.ejs                   # View-specific JavaScript file for menu page
    │   ├── profile_js.ejs                # View-specific JavaScript file for profile page
    │   └── signup_js.ejs
    ├── templates                         # Templates of reusable code
    │   ├── footer.ejs                    # The footer of each ejs page
    │   ├── header.ejs                    # The header of each ejs page
    │   ├── item.ejs                      # The item page
    │   ├── navbar_bottom.ejs             # The bottom navbar
    │   └── navbar_top.ejs                # The top navbar
    ├── 404.ejs                           # 404 page
    ├── chat.ejs                          # Chat page
    ├── compare.ejs                       # Compare page
    ├── easteregg.ejs                     # Easter egg page
    ├── filtered_page.ejs                 # Filtered page
    ├── find_username.ejs                 # Find username page
    ├── forgot.ejs                        # Forgot page
    ├── home.ejs                          # Home page
    ├── index_before_login.ejs            # Index page before login
    ├── item.ejs                          # Item page
    ├── login.ejs                         # Login page
    ├── menu.ejs                          # Menu page
    ├── mytray.ejs                        # My tray page
    ├── onboarding_goal.ejs               # Onboarding goal page
    ├── profile.ejs                       # Profile page
    ├── restaurant.ejs                    # Restaurant page
    ├── security_questions.ejs            # Security questions page
    ├── signup.ejs                        # Signup page
    ├── signup_profile.ejs                # Signup profile page
    ├── update.ejs                        # Update page
    └── username_search.ejs               # Username search page

```

## 4. Installation and Setup

### 4.1 Prerequisites:

- Node.js: Make sure you have Node.js installed globally on your machine. You can download it from the official website: Node.js
- IDE: Choose an Integrated Development Environment (IDE) of your choice. Some popular options include Visual Studio Code, WebStorm, or Atom.

### 4.2 Clone the Repository:

Clone the project repository from GitHub using the following command:

```bash
git clone https://github.com/ECHOOWWW/2800_202310_BBY20
```

### 4.3 Install NPM Packages:

Navigate to the project directory in your terminal or command prompt.
Run the following command to install the required npm packages:

```bash
npm install
```

### 4.4 Import the datasets into your own MongoDB database

1. Create your MongoDB account at https://account.mongodb.com/account/register
2. Create a new database, and create 2 collections `fastfoodnutrition` and `restaurants` in the same database
3. Download Studio 3T at https://studio3t.com/download/
4. Connect to your database in Studio 3T, and import the 2 csv files under the `/datasets` folder to the corresponding collection

### 4.5 Configure Environment Variables:

Create a new file in the project root directory called `.env`.
Open the `.env` file and add the following necessary environment variables.

```js
MONGODB_HOST= //your own MongoDB host
MONGODB_USER= //your own MongoDB account username
MONGODB_PASSWORD= //your own MongoDB account password
MONGODB_DATABASE= // the name of your database
MONGODB_SESSION_SECRET= // your own MongoDB session secret, generate at https://guidgenerator.com/
NODE_SESSION_SECRET= // your own Node.js session secret, generate at https://guidgenerator.com/
OPEN_AI_KEY= //generate with your own OpenAI account at https://platform.openai.com/account/api-keys
GOOGLE_MAPS_API_KEY= //generate with your own google at https://console.cloud.google.com/google/maps-apis
```

### 4.6 Start the Application:

Run the following command to start the application:

```
npm start
```

### 4.7 Access the Application:

Once the application has started successfully, you can access it in your web browser at http://localhost:3030 (or a different port if specified).
By following these steps, you should be able to install and run the project locally on your machine. Make sure to review the project's documentation for any additional configuration or setup required for specific features or modules.

## 5. Features and Usage

### 5.1 Create an account

To create an account, follow these steps:

1. Open the web app in your preferred browser.
2. Click on the "ACCESS" button.
3. Click the link "don't have an account? register here".
4. Fill out the required information, including your username, first name, last name, email, birthday, password.
5. Click on the "SIGN UP" button to proceed to the security questions.
6. Answer all the 3 security questions for future password reset, click on the "SUBMIT" button to proceed to set your nutritional goal.
7. Answer all the questions by typing/select your answer, click on the "CALCULATE" button to see your personalized nutritional goal.
8. Click on the "Start My Journey" button, now you're logged in as a new user, and directed to the homepage.

### 5.2 Browse, search and filter food items

You can browse, search, and filter fast food items in DriveThruDiet.

#### Browse

1. Log in to your account and navigate to the restaurant page by clicking second icon in the bottom navbar.
2. Click on the logo of restaurant you're interested in, and browse the menu of it.

#### Search

1. Log in to your account and navigate to any page, click on the universal search bar, and type your keyword in it.
2. Check search results in the dropdown.

#### Filter

1. Log in to your account and navigate to any page, click on the filter icon in the search bar, and select one or more condition, click on "Apply Filter".
2. Browse the result page.

### 5.3 NutriFacts

The NutriFacts feature provides nutritional information about food items. To access NutriFacts:

1. Click on the cards in menu or filter result page, or click on the item in the search result dropdown.
2. Read the NutriFacts about the selected food item.

### 5.4 The food tray

The food tray feature allows you to save your interested food items, and browse their nutrition sums conviniently. Follow these steps:

1. In the menu page/ filter result page/ NutriFacts page, click on the "Add" button.
2. Access your food tray by clicking on the tray icon in upper right corner to toggle the sidebar.
3. Check the nutritional values and remove items from the tray.
4. You can also check the sums of macro nutrients from the bottom banner.

### 5.5 Compare items

To compare nutrients food items, follow these steps:

1. Select 2 food items to compare by clicking the "COMPARE" in the NutriFacts page.
2. Open the sidebar by clicking the icon in the upper right corner, click on the "COMPARE" button in the bottom.
3. Check the comparison details of the 2 items.

### 5.6 The AI assistant -- FastFoodie

FastFoodie is an AI assistant that provides personalized recommendations and assistance. To interact with FastFoodie:

1. Navigate to FastFoodie page by clicking on the robot icon in the bottom navbar.
2. Follow the prompts and provide necessary information, there will be personalized recommendations generated for you.
3. You can also ask FastFoodie other questions regarding fast food by sending your question in the chat.

### 5.7 Personal profile and goals

DriveThruDiet allows you to set personal goals and manage your profile information. Here's how:

1. Go to profile page by clicking on the profile icon in the upper left corner.
2. Click on the "EDIT" button, and change any information you wanna change.
3. Update your profile information, click the "SAVE" button, and your nutritional goals will be updated with your new profile.

### 5.8 Username recovery & password reset

If you forget your username or need to reset your password, follow these steps:

1. In the login page, access the username recovery page by clicking the "Forgot" link in username field, or access the password reset by clicking the "Reset" link in the password field.
2. Provide the requested information. Username recovery: email, first name, last name, and birthday. Password reset: username, answer to one security question, and new passwor.
3. Submit the form to finish the username recovery or password reset process.

## 6. References

1. Fast food nutrition dataset from Kaggle https://www.kaggle.com/datasets/ulrikthygepedersen/fastfood-nutrition?resource=download
2. Some code generated by ChatGPT and New Bing, as cited in the files
3. Progress rings in the homepage based on https://dev.to/vaibhavkhulbe/let-s-make-and-wear-those-css-3-progress-rings-2ngf*/
4. All images sourced from https://www.freepik.com/

## 7. About AI

1. Did you use AI to help create your app? If so, how? Be specific.

> Throughout the process of developing our app, we made extensive use of AI in diverse ways. Our team employed AI tools like ChatGPT, New Bing, and other language-based AI models to examine and comprehend code that had been authored by others. This allowed us to gain insights and learn from their code, facilitating our own development process. AI also played a crucial role in aiding us with debugging tasks and implementing various features. Furthermore, we integrated AI-powered extensions such as Copilot directly into our IDE, resulting in notable improvements to our coding efficiency and receiving valuable suggestions for code completion.

2. Did you use AI to create data sets or clean data sets? If so, how? Be specific.

> While we didn't use AI specifically for creating or cleaning datasets, we employed traditional data analysis and cleaning techniques. Our team manually curated and prepared the datasets, ensuring their accuracy and relevance to our app's functionalities. We utilized data cleaning processes such as removing duplicate entries, handling missing values, and standardizing data formats to ensure the quality and consistency of the datasets.

3. Does your app use AI? If so, how? Be specific.

> Yes, our app incorporates AI functionality. We integrated the OpenAI API into our app, specifically utilizing the davinci-003 model. This enabled us to develop a chatbot named FastFoodie, which responds to user prompts and provides relevant information and recommendations related to fast food. The AI-powered chatbot enhances the user experience by delivering personalized and insightful responses based on the user's queries.

4. Did you encounter any limitations? What were they, and how did you overcome them? Be specific.

> Yes, we did encounter some limitations during the development process. One of the challenges we faced was the need for thorough configuration of the code generated by AI, especially since we were collaborating on a group project. While AI tools like ChatGPT and Copilot provided valuable assistance in generating code, we had to ensure that the output aligned with our project requirements and coding standards. This involved carefully reviewing and modifying the AI-generated code to fit our specific needs and maintaining consistency across the project. We addressed this limitation by allocating sufficient time for configuration and customization to guarantee the code's accuracy, reliability, and alignment with our project objectives.

## 8. Contact Information

|              |  Github  |                Email |
| :----------- | :------: | -------------------: |
| Min Ji Seo   | Munnjee  |    mseo12@my.bcit.ca |
| Iris Xu      | IrisWRX  |     wxu64@my.bcit.ca |
| Kalvin Leung |  KalvL   | kleung204@my.bcit.ca |
| Echo Wang    | ECHOOWWW |  ywang623@my.bcit.ca |
