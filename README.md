# Recrud
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Usage

### Configure

```js
// recrud.config.js
import { configure } from 'recrud'
import { crudRequest } from 'recrud/saga'

export default configure({
  baseUrl: 'https://example.com/api',
  crudRequest
})
```

### Root/non-nested resources

```js
// components/Team/service.js
import recrud from './recrud.cofig.js'

export const crud = recrud.makeCrud({
  resource: 'users',
  actionPrefix: 'USER'
})

// components/Team/sagas.js
yield fork(crud.request.fetchList)
```

### Nested resources

```js
// components/TeamPlayer/service.js
export const crud = recrud.makeCrud({
  resource: ({ partitionKeyValue }) => `teams/${partitionKeyValue}/players`,
  key: 'name',
  actionPrefix: 'TEAM_PLAYER'
})

// components/TeamPlayer/sagas.js
yield fork(crud.request.fetchList, {
  partitionKeyValue: teamName
})
```

### Complex/deeply-nested resources

```js
// components/TeamPlayerGame/service.js
export const crud = recrud.makeCrud({
  resource: ({ teamName, playerId }) => `teams/${teamName}/players/${playerId}/games`,
  key: 'id',
  actionPrefix: 'TEAM_PLAYER_GAME',
  responseCollectionKey: 'teamPlayerGames',
  defaultRequestParameters: {
    prefix: '/complex/'
  }
})

// components/TeamPlayerGame/sagas.js
yield fork(crud.request.fetchList, {
  partitionKeyValue: `${teamName}:${playerId}`,
  resourceArgs: { teamName, playerId }
})
```

### Additional requestors

```js
export const crud = recrud.makeCrud({
  resource: ({ partitionKeyValue }) => `teams/${partitionKeyValue}/players`,
  key: 'name',
  actionPrefix: 'TEAM_PLAYER'
})

crud.request.search = crud.makeRequestor({
  type: 'fetchList',
  service: crud.serviceFactory({ resource: 'players' })
})
```
