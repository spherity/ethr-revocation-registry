# Ethereum Revocation Registry (EIP-5539)

## Development

To get the test suite running you need a local instance of Ganache.
This projects supplies a `docker-compose` that starts up a local instance:

```
npm run init
```

The migration will deploy the contract to the local chain:

```
npm run migrate
```

Then you can generate the contract's types:

```
npm run generate-types
```
