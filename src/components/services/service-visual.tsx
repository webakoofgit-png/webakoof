import { useId, type ReactNode } from "react";
const yellow = "#ffd400",
  ink = "#151515";
const labels = [
  "Responsive website design",
  "E-commerce experiences",
  "Connected business applications",
  "Search visibility & growth",
  "Website redesign & optimisation",
  "Website care & security",
];
function Window({
  x = 88,
  y = 104,
  width = 416,
  height = 258,
  children,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children: ReactNode;
}) {
  return (
    <g className="illustration-panel">
      <rect x={x} y={y} width={width} height={height} rx={15} fill="white" stroke="#deded7" />
      <path d={`M ${x} ${y + 34} H ${x + width}`} stroke="#e7e7e0" />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={x + 17 + i * 12}
          cy={y + 17}
          r={3}
          fill={i === 0 ? yellow : "#d8d8d0"}
        />
      ))}
      {children}
    </g>
  );
}
function Check({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M ${x} ${y + 5} l 6 6 l 12 -14`}
      fill="none"
      stroke={ink}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
export function ServiceVisual({ index }: { index: number }) {
  const id = useId(),
    kind = Math.max(0, Math.min(5, index));
  return (
    <div className="branded-service-illustration">
      <svg viewBox="0 0 600 480" role="img" aria-labelledby={id} xmlns="http://www.w3.org/2000/svg">
        <title id={id}>{`WEBakoof illustration: ${labels[kind]}`}</title>
        <g fontFamily="Manrope, Arial, sans-serif" fill={ink}>
          <circle cx={330} cy={244} r={184} fill={yellow} />
          <circle cx={330} cy={244} r={211} fill="none" stroke="#e8e8df" strokeDasharray="3 9" />
          {[0, 1, 2, 3, 4].map((row) =>
            [0, 1, 2, 3, 4, 5].map((col) => (
              <circle
                key={`${row}-${col}`}
                cx={64 + col * 15}
                cy={68 + row * 15}
                r={1.5}
                fill="#d6d6cd"
              />
            )),
          )}
          <g className="illustration-scene">
            {kind === 0 && (
              <>
                <Window>
                  <rect x={112} y={158} width={35} height={35} rx={9} fill={yellow} />
                  <text x={119} y={183} fontSize={24} fontWeight={900}>
                    w.
                  </text>
                  <rect x={164} y={165} width={128} height={8} rx={4} />
                  <rect x={164} y={181} width={85} height={6} rx={3} fill="#c6c6bb" />
                  <rect x={112} y={217} width={175} height={12} rx={6} />
                  <rect x={112} y={241} width={150} height={7} rx={3} fill="#c6c6bb" />
                  <rect x={112} y={259} width={127} height={7} rx={3} fill="#c6c6bb" />
                  <rect x={112} y={289} width={99} height={31} rx={7} fill={yellow} />
                  <rect x={314} y={158} width={161} height={170} rx={12} fill="#f3f3ed" />
                  <circle cx={394} cy={240} r={55} fill={yellow} />
                  <path
                    d="M374 225 l-16 15 16 15 M414 225 l16 15 -16 15 M401 219 l-13 42"
                    fill="none"
                    stroke={ink}
                    strokeWidth={5}
                    strokeLinecap="round"
                  />
                </Window>
                <rect x={431} y={214} width={91} height={174} rx={20} />
                <rect x={437} y={222} width={79} height={158} rx={14} fill="white" />
                <rect x={460} y={225} width={32} height={5} rx={3} />
                <rect x={449} y={245} width={55} height={56} rx={8} fill={yellow} />
                {[0, 1, 2].map((i) => (
                  <rect
                    key={i}
                    x={449}
                    y={317 + i * 13}
                    width={i === 2 ? 33 : 55}
                    height={5}
                    rx={2}
                    fill={i === 0 ? ink : "#c6c6bb"}
                  />
                ))}
                <path d="M272 304 l7 33 8 -12 14 5 -29 -26" stroke="white" strokeWidth={2} />
              </>
            )}
            {kind === 1 && (
              <>
                <Window>
                  {[0, 1, 2].map((i) => (
                    <g key={i}>
                      <rect
                        x={111 + i * 123}
                        y={158}
                        width={109}
                        height={126}
                        rx={10}
                        fill="#f4f4ef"
                      />
                      <path
                        d={`M ${137 + i * 123} 205 h57 l-6 52 h-45 Z`}
                        fill={i === 1 ? ink : yellow}
                      />
                      <path
                        d={`M ${151 + i * 123} 211 v-12 a14 14 0 0 1 28 0 v12`}
                        fill="none"
                        stroke={i === 1 ? yellow : ink}
                        strokeWidth={3}
                      />
                      <rect x={113 + i * 123} y={299} width={80} height={6} rx={3} />
                      <rect x={113 + i * 123} y={313} width={49} height={5} rx={2} fill="#bcbcb1" />
                    </g>
                  ))}
                </Window>
                <rect x={339} y={335} width={199} height={65} rx={12} />
                <circle cx={372} cy={367} r={18} fill={yellow} />
                <Check x={363} y={362} />
                <text x={403} y={364} fill="white" fontSize={13} fontWeight={700}>
                  Secure checkout
                </text>
                <text x={403} y={383} fill="#bfbfb5" fontSize={10}>
                  A clear path to purchase
                </text>
              </>
            )}
            {kind === 2 && (
              <>
                <Window>
                  <rect x={102} y={151} width={76} height={193} rx={8} />
                  <text x={121} y={182} fontSize={23} fontWeight={900} fill={yellow}>
                    w.
                  </text>
                  {[0, 1, 2, 3].map((i) => (
                    <rect
                      key={i}
                      x={116}
                      y={206 + i * 28}
                      width={48}
                      height={9}
                      rx={4}
                      fill={i === 0 ? yellow : "#686862"}
                    />
                  ))}
                  <text x={202} y={174} fontSize={12} fontWeight={800}>
                    ONE CONNECTED WORKSPACE
                  </text>
                  {[0, 1, 2].map((i) => (
                    <g key={i}>
                      <rect
                        x={202 + i * 90}
                        y={193}
                        width={77}
                        height={62}
                        rx={8}
                        fill={i === 1 ? yellow : "#f3f3ed"}
                      />
                      <rect x={214 + i * 90} y={208} width={32} height={5} rx={2} fill="#909088" />
                      <rect x={214 + i * 90} y={224} width={47} height={11} rx={3} />
                    </g>
                  ))}
                  <path d="M231 296 H439" stroke={ink} strokeWidth={2} />
                  {[0, 1, 2].map((i) => (
                    <g key={i}>
                      <rect
                        x={207 + i * 91}
                        y={275}
                        width={62}
                        height={43}
                        rx={9}
                        fill="white"
                        stroke="#deded7"
                      />
                      <Check x={229 + i * 91} y={290} />
                    </g>
                  ))}
                </Window>
                <rect x={337} y={337} width={193} height={60} rx={12} />
                <text x={355} y={363} fontSize={12} fontWeight={700} fill="white">
                  People. Data. Workflow.
                </text>
                <text x={355} y={382} fontSize={10} fill={yellow}>
                  Built around your business
                </text>
              </>
            )}
            {kind === 3 && (
              <>
                <Window>
                  <rect
                    x={112}
                    y={160}
                    width={365}
                    height={42}
                    rx={21}
                    fill="#f4f4ef"
                    stroke="#deded7"
                  />
                  <circle cx={135} cy={179} r={8} fill="none" stroke={ink} strokeWidth={2} />
                  <path d="M141 186 l6 6" stroke={ink} strokeWidth={2} />
                  <text x={162} y={185} fontSize={12} fontWeight={700}>
                    Your business, discovered.
                  </text>
                  {[0, 1, 2].map((i) => (
                    <g key={i}>
                      <rect
                        x={113}
                        y={223 + i * 37}
                        width={i === 0 ? 212 : 175}
                        height={7}
                        rx={3}
                        fill={i === 0 ? ink : "#96968c"}
                      />
                      <rect
                        x={113}
                        y={237 + i * 37}
                        width={i === 0 ? 278 : 229}
                        height={5}
                        rx={2}
                        fill="#d2d2c9"
                      />
                    </g>
                  ))}
                </Window>
                <rect x={361} y={241} width={171} height={150} rx={13} />
                <text x={379} y={269} fontSize={10} fill="white" fontWeight={700}>
                  VISIBILITY THAT GROWS
                </text>
                {[30, 49, 67, 88].map((h, i) => (
                  <rect
                    key={i}
                    x={382 + i * 32}
                    y={367 - h}
                    width={21}
                    height={h}
                    rx={4}
                    fill={i === 3 ? "white" : yellow}
                  />
                ))}
                <path
                  d="M393 340 l33 -26 30 -4 33 -32 M477 278 h12 v12"
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                />
              </>
            )}
            {kind === 4 && (
              <>
                <Window x={57} y={142} width={221} height={220}>
                  <text x={76} y={200} fontSize={11} fill="#77776e" fontWeight={700}>
                    BEFORE
                  </text>
                  {[0, 1, 2].map((i) => (
                    <rect key={i} x={76} y={215 + i * 31} width={181} height={22} fill="#e5e5dd" />
                  ))}
                  <rect x={76} y={320} width={67} height={16} fill="#c9c9bf" />
                </Window>
                <Window x={318} y={96} width={229} height={279}>
                  <text x={338} y={153} fontSize={11} fontWeight={800}>
                    REIMAGINED
                  </text>
                  <rect x={337} y={172} width={189} height={79} rx={9} fill={yellow} />
                  <path
                    d="M389 213 l16 -17 25 34 20 -26 24 26"
                    fill="none"
                    stroke={ink}
                    strokeWidth={4}
                  />
                  {[0, 1, 2].map((i) => (
                    <rect
                      key={i}
                      x={337 + i * 66}
                      y={265}
                      width={57}
                      height={49}
                      rx={7}
                      fill="#f0f0e9"
                    />
                  ))}
                  <rect x={337} y={329} width={95} height={23} rx={6} />
                </Window>
                <circle cx={295} cy={247} r={25} />
                <path
                  d="M283 247 h24 M299 239 l8 8 -8 8"
                  fill="none"
                  stroke={yellow}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              </>
            )}
            {kind === 5 && (
              <>
                <Window>
                  <path
                    d="M194 169 l58 23 v49 c0 45 -58 74 -58 74 s-58 -29 -58 -74 v-49 Z"
                    fill={yellow}
                    stroke={ink}
                    strokeWidth={3}
                  />
                  <path
                    d="M168 239 l18 18 35 -40"
                    fill="none"
                    stroke={ink}
                    strokeWidth={7}
                    strokeLinecap="round"
                  />
                  {["Updates", "Backups", "Security", "Performance"].map((label, i) => (
                    <g key={label}>
                      <circle cx={293} cy={183 + i * 42} r={12} fill={yellow} />
                      <Check x={284} y={178 + i * 42} />
                      <text x={314} y={188 + i * 42} fontSize={13} fontWeight={700}>
                        {label}
                      </text>
                    </g>
                  ))}
                </Window>
                <rect x={122} y={340} width={215} height={55} rx={12} />
                <circle cx={149} cy={367} r={5} fill={yellow} />
                <text x={164} y={372} fontSize={12} fontWeight={700} fill="white">
                  Care beyond the launch.
                </text>
              </>
            )}
          </g>
          <rect x={209} y={36} width={182} height={43} rx={22} />
          <text x={232} y={64} fontSize={21} fontWeight={900} fill={yellow}>
            w.
          </text>
          <text x={271} y={63} fontSize={15} fontWeight={800} fill="white">
            WEBakoof
          </text>
          <text
            x={300}
            y={458}
            textAnchor="middle"
            fontSize={12}
            fontWeight={650}
            letterSpacing={0.4}
          >
            {labels[kind]}
          </text>
        </g>
      </svg>
    </div>
  );
}
