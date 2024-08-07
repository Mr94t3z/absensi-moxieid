import { Button, Frog } from 'frog'
import { neynar } from 'frog/middlewares'
import { handle } from 'frog/vercel'
import { StackClient } from "@stackso/js-core";
import { format, toZonedTime } from 'date-fns-tz';
import dotenv from 'dotenv';

// Uncomment this packages to tested on local server
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'

// Load environment variables from .env file
dotenv.config();

// Initialize the client
const stack = new StackClient({
  // Get your API key and point system id from the Stack dashboard (stack.so)
  apiKey: process.env.STACK_API_KEY || '', 
  pointSystemId: parseInt(process.env.STACK_POINT_SYSTEM_ID || ''),
});


export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  initialState: {
    lastClick: {} // This will store the last click time for each user
  },
  title: 'Absensi Moxie ID',
  // hub: {
  //   apiUrl: "https://hubs.airstack.xyz",
  //   fetchOptions: {
  //     headers: {
  //       "x-airstack-hubs": process.env.AIRSTACK_API_KEY || '',
  //     }
  //   }
  // },
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor', 'cast'],
  }),
)

app.frame('/', (c) => {
  const { buttonValue, status } = c;

  // Get the current UTC time and convert it to Indonesian time (WIB)
  const now = new Date();
  const timeZone = 'Asia/Jakarta';
  const zonedTime = toZonedTime(now, timeZone);
  const currentTime = format(zonedTime, 'HH:mm');
  const currentDate = format(zonedTime, 'yyyy-MM-dd');

  // Check if the current time is 07:00 WIB
  const isAllowedTime = currentTime === '07:00';

  console.log('currentDate:', currentDate);

  console.log('Current time:', currentTime);

  console.log('isAllowedTime:', isAllowedTime);

  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        {status === 'initial' ? (
          'Click the button at 07:00 WIB!'
        ) : (
          `Button clicked at: ${buttonValue}`
        )}
      </div>
    ),
    intents: isAllowedTime
      ? [
          <Button value={new Date().toLocaleTimeString()}>
            Absen
          </Button>,
        ]
      : [],
  });
});

// Uncomment for local server testing
devtools(app, { serveStatic });


export const GET = handle(app)
export const POST = handle(app)
