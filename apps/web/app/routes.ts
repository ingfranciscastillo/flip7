import { type RouteConfig, route, index } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('how-to-play', 'routes/how-to-play.tsx'),
  route('lobby/:code', 'routes/lobby.tsx'),
  route('game/:code', 'routes/game.tsx'),
  route('over/:code', 'routes/game-over.tsx'),
] satisfies RouteConfig;
