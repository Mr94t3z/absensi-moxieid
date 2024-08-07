import { Button, Frog } from 'frog'
import { neynar } from 'frog/middlewares'
import { handle } from 'frog/vercel'
import { 
  Box, 
  Image,
  Text, 
  Spacer, 
  vars 
} from "../lib/ui.js";
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
  apiKey: process.env.STACK_API_KEY || '', 
  pointSystemId: parseInt(process.env.STACK_POINT_SYSTEM_ID || ''),
});

// stack.so leaderboard URL
const PUBLIC_URL_MOXIE_ID_LEADERBOARD = 'https://www.stack.so/leaderboard/catatan-absensi-moxieid';

// Neynar API base URL
const baseUrlNeynarV2 = process.env.BASE_URL_NEYNAR_V2 || 'https://api.neynar.com/v2/farcaster';


export const app = new Frog({
  assetsPath: '/',
  basePath: '/api/frame',
  ui: { vars },
  title: 'Absensi Moxie ID',
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": process.env.AIRSTACK_API_KEY || '',
      }
    }
  },
  imageAspectRatio: '1:1',
  imageOptions: {
    height: 1024,
    width: 1024,
  },
  browserLocation: PUBLIC_URL_MOXIE_ID_LEADERBOARD,
  headers: {
    'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate max-age=0, s-maxage=0',
  },
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor', 'cast'],
  }),
)

app.frame('/', (c) => {
  // Get the current UTC time and convert it to Indonesian time (WIB)
  const now = new Date();
  const timeZone = 'Asia/Jakarta';
  const zonedTime = toZonedTime(now, timeZone);
  const currentDate = format(zonedTime, 'yyyy-MM-dd');

  return c.res({
    image: (
      <Box
          grow
          alignVertical="center"
          alignHorizontal="center"
          backgroundColor="red"
          padding="32"
          textAlign="center"
          height="100%"
        >

          <Text align="center" weight="600" color="white" size="64">
            Absensi
          </Text>

          <Spacer size="18" />

          <Image 
            src="/moxieid.png" 
            height="256"
            />

          <Spacer size="18" />

          <Text align="center" weight="600" color="white" size="64">
            Moxie ID
          </Text>

      </Box>
    ),
    intents: [
      <Button action={`/absen/${currentDate}`}>
        Absen
      </Button>,
    ],
  });
});


app.frame('/absen/:currentDate', async (c) => {
  const { currentDate } = c.req.param();

  const { fid, username, verifiedAddresses } = c.var.interactor || {};
  const eth_address = verifiedAddresses?.ethAddresses[0] || '';

  try {
    const userResponse = await fetch(`${baseUrlNeynarV2}/channel/bulk?ids=moxieid&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS',
      },
    });

    // Check if the response is okay
    if (!userResponse.ok) {
      throw new Error(`Neynar API responded with status: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const user = userData.channels[0];

    const isFollowing = user.viewer_context.following;

    if (!isFollowing) {
      return c.res({
        image: (
          <Box
              grow
              alignVertical="center"
              alignHorizontal="center"
              backgroundColor="red"
              padding="32"
              textAlign="center"
              height="100%"
            >
    
              <Text align="center" weight="600" color="white" size="48">
                Kamu belum mengikuti Channel kami!
              </Text>
    
              <Spacer size="18" />
    
              <Image 
                src="/moxieid.png" 
                height="256"
                />
    
              <Spacer size="18" />
    
              <Text align="center" weight="600" color="white" size="64">
                Moxie ID
              </Text>
    
          </Box>
        ),
        intents: [
          <Button action='/'>
            Coba Lagi
          </Button>,
          <Button.Link href='https://warpcast.com/~/channel/moxieid'>
            Follow Moxie ID
          </Button.Link>,
        ],
      });
    } 

    const absen = await stack.getPoints([eth_address], { event: `${currentDate}` });
    
    const amount = absen[0].amount;

    if (absen.length === 0) {
      console.log(`${username} absen pada tanggal ${currentDate}`);
      await stack.track(`${currentDate}`, {
        points: 1,
        account: eth_address,
        uniqueId: eth_address
      });
    } 
    else {
      return c.error(
        {
          message: `Kamu sudah melakukan absen pada hari ini.`,
        }
      );
    }

    return c.res({
      image: (
        <Box
          grow
          alignVertical="center"
          alignHorizontal="center"
          backgroundColor="red"
          padding="32"
          textAlign="center"
          height="100%"
        >

          <Text align="center" weight="600" color="white" size="24">
            Terimakasih @{username}!
          </Text>

          <Spacer size="18" />

          <Text align="center" weight="600" color="white" size="24">
            Kamu telah absen {amount} Hari.
          </Text>

        </Box>
      ),
      intents: [
        <Button.Link href={PUBLIC_URL_MOXIE_ID_LEADERBOARD}>
          Catatan Absen
        </Button.Link>,
      ],
    });

  } catch (error) {
    console.error('Error:', error);

    return c.res({
      image: (
        <Box
          grow
          alignVertical="center"
          alignHorizontal="center"
          backgroundColor="red"
          padding="32"
          textAlign="center"
          height="100%"
        >
          <Text align="center" weight="600" color="white" size="20">
            Terjadi kesalahan. Silakan coba lagi nanti.
          </Text>
        </Box>
      ),
      intents: [
        <Button action='/'>
          Kembali
        </Button>,
      ],
    });
  }
});


// Uncomment for local server testing
devtools(app, { serveStatic });


export const GET = handle(app)
export const POST = handle(app)
