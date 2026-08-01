{
	description = "Create a heads up hand in Poker and share it with a friend.";

	inputs = {
		nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
	};

	outputs =
		{
			self,
			nixpkgs,
		}: let
			systems = [
				"x86_64-linux"
				"aarch64-linux"
			];
			forAllSystems = nixpkgs.lib.genAttrs systems;

			pkgsFor = system: import nixpkgs {inherit system;};

			headsUpHand = pkgs:
				pkgs.buildNpmPackage {
					pname = "heads-up-hand";
					version = "0.1.0";
					src = self;
					nodejs = pkgs.nodejs_22;
					npmDepsHash = "sha256-kpZ6xufWg7x0u3d/Cs5h0VBrNOznxuqBR7bfDIWdpFU=";

					npmBuildScript = "build";
					env.BASE_PATH = "";

					postInstall = ''
						mkdir -p $out/site
						cp -rL build/. $out/site/
					'';
				};
		in {
			packages = forAllSystems (system: {
				default = headsUpHand (pkgsFor system);
			});

			apps = forAllSystems (system: let
				pkgs = pkgsFor system;
				package = headsUpHand pkgs;
			in {
				default = {
					type = "app";
					program = let
						serve = pkgs.writeShellScriptBin "serve-heads-up-hand" ''
							exec ${pkgs.python3}/bin/python3 -m http.server "''${PORT:-8080}" --directory ${package}/site
						'';
					in "${serve}/bin/serve-heads-up-hand";
				};
			});

			devShells = forAllSystems (system: let
				pkgs = pkgsFor system;
			in {
				default = pkgs.mkShell {
					packages = with pkgs; [
						nodejs_22
						prettier
					];

					shellHook = ''
						if [ ! -d node_modules ]; then
							echo "Installing npm dependencies..."
							npm install
						fi
					'';
				};
			});
		};
}
