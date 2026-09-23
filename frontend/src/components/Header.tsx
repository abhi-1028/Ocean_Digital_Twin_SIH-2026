interface HeaderProps {
  regionName: string
}

function Header({
  regionName,
}: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-inner">

        <div className="brand">

          <div className="brand-mark">
            <span className="brand-wave">
              ≋
            </span>
          </div>

          <div className="brand-copy">
            <strong>
              OCEAN
              <span> DIGITAL TWIN</span>
            </strong>

            <small>
              Interactive ocean observation
              & modeling platform
            </small>
          </div>

        </div>

        <div className="header-right">

          <div className="system-status">
            <span className="status-dot" />

            <span>
              SYSTEM READY
            </span>
          </div>

          <div className="header-divider" />

          <div className="header-region">
            <span>
              ACTIVE REGION
            </span>

            <strong>
              {regionName}
            </strong>
          </div>

        </div>

      </div>
    </header>
  )
}

export default Header