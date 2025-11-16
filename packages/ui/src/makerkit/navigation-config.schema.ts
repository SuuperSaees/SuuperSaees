import { z } from 'zod';
const RouteMatchingEnd = z
  .union([z.boolean(), z.function().args(z.string()).returns(z.boolean())])
  .default(false)
  .optional();

export const NavigationConfigSchema = z.object({
  style: z.enum(['custom', 'sidebar', 'header']).default('sidebar'),
  routes: z.array(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('route').default('route'),
        label: z.string(),
        path: z.string(),
        Icon: z.custom<React.ReactNode>(),
        end: RouteMatchingEnd,
        className: z.string().optional(),
        menu: z.custom<React.ReactNode>().optional(),
        children: z.array(z.any()).optional(),
      }),
      z.object({
        type: z.literal('group').default('group'),
        path: z.string().optional(),
        label: z.custom<React.ReactNode>(),
        collapsible: z.boolean().optional(),
        collapsed: z.boolean().optional(),
        Icon: z.custom<React.ReactNode>(),
        className: z.string().optional(),
        menu: z.custom<React.ReactNode>().optional(),
        children: z.array(
          z.object({
            label: z.string(),
            path: z.string().optional(),
            Icon: z.custom<React.ReactNode>().optional(),
            end: RouteMatchingEnd,
            className: z.string().optional(),
            menu: z.custom<React.ReactNode>().optional(),
          }),
        ),
      }),
      z.object({
        type: z.literal('divider').default('divider'),
        divider: z.literal(true),
      }),
      z.object({
        type: z.literal('section').default('section'),
        section: z.literal(true),
        label: z.custom<React.ReactNode>(),
        path: z.string().optional(),
        className: z.string().optional(),
        menu: z.custom<React.ReactNode>().optional(),
        children: z.custom<React.ReactNode>().optional(),
        groups: z.array(
          z.object({
            type: z.literal('group').default('group'),
            path: z.string().optional(),
            label: z.custom<React.ReactNode>(),
            collapsible: z.boolean().optional(),
            collapsed: z.boolean().optional(),
            Icon: z.custom<React.ReactNode>(),
            className: z.string().optional(),
            menu: z.custom<React.ReactNode>().optional(),
            children: z.array(
              z.object({
                label: z.string(),
                path: z.string().optional(),
                Icon: z.custom<React.ReactNode>().optional(),
                end: RouteMatchingEnd,
                className: z.string().optional(),
                menu: z.custom<React.ReactNode>().optional(),
              }),
            ),
          })
        ),
      }),
      z.object({
        type: z.literal('groups').default('groups'),
        label: z.string(),
        path: z.string(),
        Icon: z.custom<React.ReactNode>(),
        end: RouteMatchingEnd,
        className: z.string().optional(),
        menu: z.custom<React.ReactNode>().optional(),
        collapsible: z.boolean().optional(),
        collapsed: z.boolean().optional(),
        groups: z.array(
          z.discriminatedUnion('type', [
            z.object({
              type: z.literal('group').default('group'),
              label: z.string(),
              collapsible: z.boolean().optional(),
              collapsed: z.boolean().optional(),
              path: z.string().optional(),
              Icon: z.custom<React.ReactNode>().optional(),
              end: RouteMatchingEnd,
              className: z.string().optional(),
              menu: z.custom<React.ReactNode>().optional(),
              children: z.array(
                z.object({
                  label: z.string(),
                  path: z.string().optional(),
                  Icon: z.custom<React.ReactNode>().optional(),
                  end: RouteMatchingEnd,
                  className: z.string().optional(),
                  menu: z.custom<React.ReactNode>().optional(),
                }),
              ),
            }),
            z.object({
              type: z.literal('route').default('route'),
              label: z.string(),
              collapsible: z.boolean().optional(),
              collapsed: z.boolean().optional(),
              path: z.string(),
              Icon: z.custom<React.ReactNode>().optional(),
              end: RouteMatchingEnd,
              className: z.string().optional(),
              menu: z.custom<React.ReactNode>().optional(),
            }),
          ])
        ),
      }),
    ]),
  ),
});









