import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "../server/routers/_app";

function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";

  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;

  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/ssr
           **/
          url: `${getBaseUrl()}/api/trpc`,
          // headers() {
          //   if (ctx?.req) {
          //     // To use SSR properly, you need to forward the client's headers to the server
          //     // This is so you can pass through things like cookies when we're server-side rendering
          //     // If you're using Node 18, omit the "connection" header
          //     const { connection: _connection, ...headers } = ctx.req.headers;
          //     return {
          //       ...headers,
          //       // Optional: inform server that it's an SSR request
          //       "x-ssr": "1",
          //     };
          //   }
          //   return {};
          // },
        }),
      ],
      /**
       * @link https://tanstack.com/query/v4/docs/reference/QueryClient
       **/
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   **/
  ssr: false,
});

export const mutateCache = function <T, Y extends { id: string }>(
  oldData: T,
  newData: Y,
  type: "create" | "update" | "delete"
) {
  switch (type) {
    case "create":
      if (oldData) {
        if (Array.isArray(oldData)) {
          return [...oldData, { ...newData }] as Y[];
        }
      } else {
        return [{ ...newData }];
      }
    case "update":
      if (oldData) {
        if (Array.isArray(oldData)) {
          const _oldData = [...oldData];

          const target = _oldData.findIndex((item) => {
            if (item.id && newData.id && item.id === newData.id) {
              return item;
            }
          });

          _oldData[target] = { ...newData };

          return _oldData;
        } else {
          return oldData;
        }
      }
    case "delete":
      if (oldData) {
        if (Array.isArray(oldData)) {
          const _oldData = [...oldData];

          const target = _oldData.findIndex((item) => {
            if (item.id && newData.id && item.id === newData.id) {
              return item;
            }
          });

          _oldData.splice(target, 1);

          return _oldData;
        } else {
          return oldData;
        }
      }
    default:
      return oldData;
  }
};
