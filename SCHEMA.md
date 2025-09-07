# Firestore Database Schema

This document outlines the schema for the Firestore database used in the Tinder for Work application.

## Collections

- **users**: Stores user profile information for both students and employers.
- **jobs**: Stores job postings created by employers.
- **applications**: Stores applications submitted by students for jobs.
- **conversations**: Stores chat conversations between users.
- **swipes**: Stores a record of each swipe action to prevent users from seeing the same job twice.

## Document Structures

### users

- **uid**: `string` - The user's unique ID from Firebase Authentication.
- **name**: `string` - The user's full name.
- **email**: `string` - The user's email address.
- **type**: `string` - The user's type, either "student" or "employer".
- **bio**: `string` (optional) - A short bio for the user.
- **location**: `string` (optional) - The user's location.
- **phone**: `string` (optional) - The user's phone number.
- **skills**: `array` (optional) - A list of the user's skills.
- **company**: `string` (optional) - The user's company name (for employers).

### jobs

- **uid**: `string` - A unique ID for the job.
- **title**: `string` - The title of the job.
- **company**: `string` - The name of the company that posted the job.
- **location**: `string` - The location of the job.
- **hourlyRate**: `number` - The hourly rate for the job.
- **duration**: `string` - The duration of the job.
- **category**: `string` - The category of the job.
- **skills**: `array` - A list of required skills for the job.
- **description**: `string` - A description of the job.
- **requirements**: `array` - A list of requirements for the job.
- **isUrgent**: `boolean` - Whether the job is urgent.
- **status**: `string` - The status of the job (e.g., "active", "draft").
- **employerId**: `string` - The ID of the employer who posted the job.
- **postedAt**: `timestamp` - The date the job was posted.

### applications

- **uid**: `string` - A unique ID for the application.
- **jobId**: `string` - The ID of the job the application is for.
- **studentId**: `string` - The ID of the student who applied.
- **status**: `string` - The status of the application (e.g., "pending", "accepted").
- **appliedAt**: `timestamp` - The date the application was submitted.

### conversations

- **uid**: `string` - A unique ID for the conversation.
- **participantIds**: `array` - A list of the IDs of the users in the conversation.
- **lastMessage**: `object` - The last message sent in the conversation.

### swipes

- **uid**: `string` - A unique ID for the swipe.
- **userId**: `string` - The ID of the user who swiped.
- **jobId**: `string` - The ID of the job that was swiped on.
- **action**: `string` - The swipe action, either "like" or "pass".
- **timestamp**: `timestamp` - The date of the swipe.
