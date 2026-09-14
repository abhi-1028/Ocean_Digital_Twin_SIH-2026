interface HeaderProps {
  regionName: string
}

function Header({ regionName }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          🌊
        </div>

        <div>
          <div className="brand-title">Ocean Digital Twin</div>
          <div className="brand-subtitle">
            Interactive ocean model & observation platform
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="status-pill">
          <span className="status-dot" />
          <span>Simulation Ready</span>
        </div>

        <div className="region-badge">
          <span className="region-icon">◉</span>
          {regionName}
        </div>

        <button className="icon-button" title="Settings">
          ⚙
        </button>
      </div>
    </header>
  )
}

export default Header