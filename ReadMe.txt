// Trello Kanban
// https://trello.com/b/0iAd749y/github-activity-progress

// --------------------------------------------
// Project Description
// --------------------------------------------
// In this project, you will build a simple command line interface (CLI) 
// to fetch the recent activity of a GitHub user and display it in 
// the terminal. This project will help you practice your programming 
// skills, including working with APIs, handling JSON data, and building 
// a simple CLI application.

// --------------------------------------------
// Requirements
// --------------------------------------------
// The application should run from the command line, accept the GitHub 
// username as an argument, fetch the user’s recent activity using the 
// GitHub API, and display it in the terminal. The user should be able to:

// * Provide the GitHub username as an argument when running the CLI.

//    [github-activity <username>]

// * Fetch the recent activity of the specified GitHub user using the GitHub API. You can use the following endpoint to fetch the user’s activity:

//     [# https://api.github.com/users/<username>/events]
//     [# Example: https://api.github.com/users/kamranahmedse/events]

// * Display the fetched activity in the terminal.

//     [Output:                                                  ]
//     |- Pushed 3 commits to kamranahmedse/developer-roadmap    |
//     |- Opened a new issue in kamranahmedse/developer-roadmap  |
//     |- Starred kamranahmedse/developer-roadmap                |
//     [- ...                                                    ]

// * You can learn more about the GitHub API here.
// * Handle errors gracefully, such as invalid usernames or API failures.
// * Use a programming language of your choice to build this project.
// * Do not use any external libraries or frameworks to fetch the GitHub activity.

// -----------------------------------------------------------------------------

// --------------------------------------------
// =========== WHAT IS THE PROJECT? ===========
// --------------------------------------------
// The project is to build a Command Line Interface that accepts a 
// GitHub username as an arguement, then fetches that user's activity to
// be displayed in the terminal. The project will use NodeJS.

// --------------------------------------------
// ============= WHAT IS THE MVP ==============
// --------------------------------------------
// The minimal viable product is a terminal that prompts for a GitHub username,
// fetches the user's activity and displays the past three actions on the terminal.

// --------------------------------------------
// ======= What are the nice to haves? ========
// --------------------------------------------
// The nice to haves for this project are to have the time and date displayed
// for each action and to prompt for result count.

// --------------------------------------------
// ==== When will the project be complete? ====
// --------------------------------------------
// The project will be complete once all the MVP features are achieved along
// with timestamps.