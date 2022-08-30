# Ethereum Revocation Registry (EIP-5539)

## Development

### Requirements

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

Everytime you change something at the contract you need to run a migration & generate the types anew if the interfaces changed.

### Test Suite

To start the test suite, you can call:

```
npm run test
```

To get a coverage report  you need to run:

```
npm run test:coverage
```