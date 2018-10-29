# A basic reactive/stream library

This library is designed to make [dirty reads](https://en.wikipedia.org/wiki/Isolation_%28database_systems%29#Dirty_reads) impossible - i.e. your computed properties will only be called when there is a consistent state for them to run on.

This library runs calculations synchronously and eagerly.  If you have a ton of upstream data changing and want lazy calculations, use [shiz](https://github.com/tehshrike/shiz).

## Examples


