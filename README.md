# Betting using smart contracts

## How to use

### Install

~~~
pnpm i
~~~

### Launch Ganache

Launchs Ganache with the same accounts every time and stores them in acounts.json
Everyone starts with 100ETH
~~~
pnpx -y ganache-cli -d --account_keys_path accounts.json
~~~

### Compiling

~~~
pnpx truffle compile
pnpx truffle migrate --reset
~~~

### Execute scripts

~~~
pnpx truffle exec ./scripts/
~~~
