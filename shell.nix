{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "node";
  buildInputs = [ pkgs.nodejs-14_x ];
  shellHook = ''
    export PATH="$PWD/node_modules/.bin/:$PATH"
  '';
}
