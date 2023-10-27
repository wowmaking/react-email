import _ from 'lodash';
import qs from 'query-string';
import * as React from 'react';

import { Button } from './button';

type SidebarElement = React.ElementRef<'aside'>;
type RootProps = React.ComponentPropsWithoutRef<'aside'>;

interface SidebarProps extends RootProps {
  params: any;
  env: any;
}

export const Parameters = React.forwardRef<SidebarElement, Readonly<SidebarProps>>(
  ({ className, params, env, ...props }, forwardedRef) => {

    const [config, setConfig] = React.useState(params);

    const onFormChange = (p, e) => {
      setConfig({
        ...config,
        [p]: e.target.value,
      });
    }

    const onFormSubmit = (e) => {
      e.preventDefault();
      window.location.href = window.location.origin + window.location.pathname + '?' + qs.stringify(_.mapValues(config, v => v || undefined));
    }

    return (
      <aside
        ref={forwardedRef}
        className="px-6 min-w-[400px] max-w-[400px] flex flex-col gap-4 border-r border-slate-6"
        {...props}
      >
        <div className="h-[70px] flex items-center">
          Parameters
        </div>

        <nav className="flex flex-col gap-4">
          <form onSubmit={onFormSubmit} className="mt-1">
            {Object.keys(params).map(p => (
              <React.Fragment key={p}>
                <label
                  htmlFor={`p${p}`}
                  className="text-slate-10 text-xs uppercase mb-2 block"
                >
                  {p}
                </label>
                <input
                  className="appearance-none rounded-lg px-2 py-1 mb-3 outline-none w-full bg-slate-3 border placeholder-slate-8 border-slate-6 text-slate-12 text-sm focus:ring-1 focus:ring-slate-12 transition duration-300 ease-in-out"
                  onChange={(e) => onFormChange(p, e)}
                  defaultValue={params[p]}
                  placeholder={env[p]}
                  id={`p${p}`}
                />
              </React.Fragment>
            ))}
            <Button
              type="submit"
              className="disabled:bg-slate-11 disabled:border-transparent mb-2"
            >
              Apply
            </Button>
          </form>
        </nav>
      </aside>
    );
  },
);


Parameters.displayName = 'Parameters';
