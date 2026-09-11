# Budget Tracking System

A private budget tracker for a local Wi-Fi network.

## Requirements

Install Node.js LTS on the computer that will run the server. npm is included with Node.js.

## Start the application

Open PowerShell in this project folder and run:

```text
npm install
npm start
```

Then open this address on the server computer:

```text
http://localhost:3000
```

The first server start creates the SQLite database in `data/budget.sqlite`.

## Initial accounts

The first database setup creates these accounts:

```text
Username: user1    Password: ChangeMe1!
Username: user2    Password: ChangeMe2!
Username: user3    Password: ChangeMe3!
```

A legacy admin/admin account is also created for local testing. These are starter passwords for the private local network and should be changed before regular use by adding a password-change feature.

## Other devices on the same Wi-Fi

Find the server computer's private IPv4 address, then open this from another device:

```text
http://SERVER-IP-ADDRESS:3000
```

For example:

```text
http://192.168.1.25:3000
```

Do not configure router port forwarding. The server is intended to remain private to the local network.

If another device cannot connect, Windows Firewall may need a local inbound rule for TCP port 3000.

## Data

- Expense data is stored in SQLite.
- Login sessions are stored in SQLite.
- Each expense belongs to the logged-in user.
- The browser no longer stores expenses in localStorage.
